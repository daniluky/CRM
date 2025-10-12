const mongoose = require('mongoose');
const { computeSalePrice } = require('../utils/pricing');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: String,
  barcode: {
    type: String,
    unique: true,
    required: true,
    index: true
  },
  base_price: {
    type: Number,
    default: 0
  },
  sale_price: {
    type: Number,
    default: 0
  },
  price_mode: {
    type: String,
    enum: ['auto', 'manual'],
    default: 'auto'
  },
  stock_qty: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

// Middleware para calcular precio de venta automático
productSchema.pre('save', function (next) {
  if (this.price_mode === 'auto') {
    this.sale_price = computeSalePrice(this.base_price);
  }
  next();
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
