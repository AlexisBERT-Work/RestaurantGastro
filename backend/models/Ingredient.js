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
    enum: ['vegetable', 'meat', 'cheese', 'spice', 'sauce', 'other'],
    default: 'other'
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
