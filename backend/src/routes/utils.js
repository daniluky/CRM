const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// Búsqueda por código de barras
router.get('/product-by-barcode/:barcode', async (req, res, next) => {
  try {
    const product = await Product.findOne({ barcode: req.params.barcode });
    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json(product);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
