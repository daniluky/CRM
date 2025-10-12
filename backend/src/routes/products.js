const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const StockMovement = require('../models/StockMovement');
const { computeSalePrice } = require('../utils/pricing');
const Joi = require('joi');

// Validación para crear/actualizar producto
const productSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().allow('', null),
  barcode: Joi.string().required(),
  base_price: Joi.number().min(0).required(),
  price_mode: Joi.string().valid('auto', 'manual').default('auto'),
  sale_price: Joi.number().min(0).when('price_mode', {
    is: 'manual',
    then: Joi.required()
  }),
  initial_stock: Joi.number().integer().min(0)
});

// Crear producto
router.post('/', async (req, res, next) => {
  try {
    const { error, value } = productSchema.validate(req.body);
    if (error) throw error;

    const { initial_stock, ...productData } = value;

    if (productData.price_mode === 'auto') {
      productData.sale_price = computeSalePrice(productData.base_price);
    }

    const product = new Product(productData);

    if (initial_stock) {
      product.stock_qty = initial_stock;
    }

    await product.save();

    if (initial_stock) {
      await StockMovement.create({
        productId: product._id,
        type: 'arrival',
        qty: initial_stock,
        note: 'Stock inicial'
      });
    }

    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
});

// Listar productos
router.get('/', async (req, res, next) => {
  try {
    const { query, low_stock } = req.query;
    let filter = {};

    if (query) {
      filter.$or = [
        { name: { $regex: query, $options: 'i' } },
        { barcode: { $regex: query, $options: 'i' } }
      ];
    }

    if (low_stock === 'true') {
      filter.stock_qty = { $lte: 2 };
    }

    const products = await Product.find(filter).sort({ name: 1 });
    res.json(products);
  } catch (err) {
    next(err);
  }
});

// Obtener producto
router.get('/:id', async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json(product);
  } catch (err) {
    next(err);
  }
});

// Actualizar producto
router.put('/:id', async (req, res, next) => {
  try {
    const { error, value } = productSchema.validate(req.body);
    if (error) throw error;

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    if (value.price_mode === 'auto') {
      value.sale_price = computeSalePrice(value.base_price);
    }

    Object.assign(product, value);
    await product.save();

    res.json(product);
  } catch (err) {
    next(err);
  }
});

// Eliminar producto
router.delete('/:id', async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
