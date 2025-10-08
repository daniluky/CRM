const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const StockMovement = require('../models/StockMovement');
const { exportToCsv } = require('../utils/csv');
const Joi = require('joi');

// Validación de movimientos
const movementSchema = Joi.object({
  barcode: Joi.string(),
  productId: Joi.string(),
  qty: Joi.number().integer().required(),
  note: Joi.string()
}).xor('barcode', 'productId');

const saleSchema = Joi.object({
  lines: Joi.array().items(Joi.object({
    barcode: Joi.string().required(),
    qty: Joi.number().integer().min(1).required()
  })).min(1).required()
});

// Entrada de mercancía
router.post('/arrival', async (req, res, next) => {
  try {
    const { error, value } = movementSchema.validate(req.body);
    if (error) throw error;

    const product = value.barcode ?
      await Product.findOne({ barcode: value.barcode }) :
      await Product.findById(value.productId);

    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    product.stock_qty += value.qty;
    await product.save();

    const movement = await StockMovement.create({
      productId: product._id,
      type: 'arrival',
      qty: value.qty,
      note: value.note
    });

    res.status(201).json({ product, movement });
  } catch (err) {
    next(err);
  }
});

// Venta
router.post('/sale', async (req, res, next) => {
  try {
    const { error, value } = saleSchema.validate(req.body);
    if (error) throw error;

    const session = await Product.startSession();
    session.startTransaction();

    try {
      const lines = [];
      for (const line of value.lines) {
        const product = await Product.findOne({ barcode: line.barcode }).session(session);
        if (!product) {
          throw new Error(`Producto con código ${line.barcode} no encontrado`);
        }

        if (product.stock_qty < line.qty) {
          throw new Error('STOCK_NEGATIVE');
        }

        product.stock_qty -= line.qty;
        await product.save({ session });

        await StockMovement.create([{
          productId: product._id,
          type: 'sale',
          qty: -line.qty,
          note: 'Venta'
        }], { session });

        lines.push({
          product: {
            id: product._id,
            name: product.name,
            sale_price: product.sale_price
          },
          qty: line.qty,
          total: product.sale_price * line.qty
        });
      }

      await session.commitTransaction();
      res.status(201).json({
        lines,
        total: lines.reduce((sum, line) => sum + line.total, 0)
      });
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      session.endSession();
    }
  } catch (err) {
    next(err);
  }
});

// Devolución
router.post('/return', async (req, res, next) => {
  try {
    const { error, value } = movementSchema.validate(req.body);
    if (error) throw error;

    const product = value.barcode ?
      await Product.findOne({ barcode: value.barcode }) :
      await Product.findById(value.productId);

    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    product.stock_qty += value.qty;
    await product.save();

    const movement = await StockMovement.create({
      productId: product._id,
      type: 'return',
      qty: value.qty,
      note: value.note || 'Devolución'
    });

    res.status(201).json({ product, movement });
  } catch (err) {
    next(err);
  }
});

// Ajuste
router.post('/adjust', async (req, res, next) => {
  try {
    const { error, value } = Joi.object({
      productId: Joi.string().required(),
      qtyDelta: Joi.number().integer().required(),
      note: Joi.string().required()
    }).validate(req.body);
    if (error) throw error;

    const product = await Product.findById(value.productId);
    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    const newStock = product.stock_qty + value.qtyDelta;
    if (newStock < 0) {
      throw new Error('STOCK_NEGATIVE');
    }

    product.stock_qty = newStock;
    await product.save();

    const movement = await StockMovement.create({
      productId: product._id,
      type: 'adjust',
      qty: value.qtyDelta,
      note: value.note
    });

    res.status(201).json({ product, movement });
  } catch (err) {
    next(err);
  }
});

// Lista de bajo stock
router.get('/low-stock', async (req, res, next) => {
  try {
    const products = await Product.find({ stock_qty: { $lte: 2 } })
      .sort({ stock_qty: 1, name: 1 });

    if (req.query.format === 'csv') {
      const filename = `bajo-stock-${Date.now()}.csv`;
      await exportToCsv(products, filename);
      res.json({ message: 'CSV generado', filename });
    } else {
      res.json(products);
    }
  } catch (err) {
    next(err);
  }
});

module.exports = router;
