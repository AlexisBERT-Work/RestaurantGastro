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
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Recipe', recipeSchema);
