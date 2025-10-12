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

    const qtyByBarcode = value.lines.reduce((acc, line) => {
      acc[line.barcode] = (acc[line.barcode] || 0) + line.qty;
      return acc;
    }, {});

    const uniqueBarcodes = Object.keys(qtyByBarcode);
    const products = await Product.find({ barcode: { $in: uniqueBarcodes } });
    const productMap = new Map(products.map(product => [product.barcode, product]));

    for (const barcode of uniqueBarcodes) {
      if (!productMap.has(barcode)) {
        throw new Error(`Producto con código ${barcode} no encontrado`);
      }

      const product = productMap.get(barcode);
      if (product.stock_qty < qtyByBarcode[barcode]) {
        throw new Error('STOCK_NEGATIVE');
      }
    }

    const rollback = [];

    try {
      for (const barcode of uniqueBarcodes) {
        const totalQty = qtyByBarcode[barcode];
        const updated = await Product.findOneAndUpdate(
          { barcode, stock_qty: { $gte: totalQty } },
          { $inc: { stock_qty: -totalQty } },
          { new: true }
        );

        if (!updated) {
          throw new Error('STOCK_NEGATIVE');
        }

        rollback.push({ barcode, qty: totalQty });
      }

      await StockMovement.insertMany(value.lines.map(line => ({
        productId: productMap.get(line.barcode)._id,
        type: 'sale',
        qty: -line.qty,
        note: 'Venta'
      })));

      const responseLines = value.lines.map(line => {
        const product = productMap.get(line.barcode);
        return {
          product: {
            id: product._id,
            name: product.name,
            sale_price: product.sale_price
          },
          qty: line.qty,
          total: product.sale_price * line.qty
        };
      });

      res.status(201).json({
        lines: responseLines,
        total: responseLines.reduce((sum, line) => sum + line.total, 0)
      });
    } catch (operationError) {
      if (rollback.length) {
        await Promise.all(
          rollback.map(entry =>
            Product.updateOne({ barcode: entry.barcode }, { $inc: { stock_qty: entry.qty } })
          )
        );
      }
      throw operationError;
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
