const mongoose = require('mongoose');

const ingredientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  category: {
    type: String,
    enum: ['legume', 'viande', 'fromage', 'epice', 'sauce', 'autre'],
    default: 'autre'
  },
  cost: {
    type: Number,
    default: 10
  },
  shelfLife: {
    type: Number,
    default: 3,
    min: 1
  },
  description: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Ingredient', ingredientSchema);
