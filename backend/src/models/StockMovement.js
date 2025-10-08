const mongoose = require('mongoose');

const stockMovementSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  type: {
    type: String,
    enum: ['sale', 'return', 'arrival', 'adjust'],
    required: true
  },
  qty: {
    type: Number,
    required: true
  },
  note: String
}, { timestamps: true });

const StockMovement = mongoose.model('StockMovement', stockMovementSchema);

module.exports = StockMovement;
