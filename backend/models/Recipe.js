const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  requiredIngredients: [{
    name: String,
    quantity: Number
  }],
  description: {
    type: String,
    default: ''
  },
  difficulty: {
    type: String,
    enum: ['facile', 'moyen', 'difficile'],
    default: 'moyen'
  },
  price: {
    type: Number,
    default: 50
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Recipe', recipeSchema);
