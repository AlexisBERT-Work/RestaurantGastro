const mongoose = require('mongoose');

const userIngredientSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  ingredientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ingredient',
    required: true
  },
  quantity: {
    type: Number,
    default: 0,
    min: 0
  }
});

userIngredientSchema.index({ userId: 1, ingredientId: 1 }, { unique: true });

module.exports = mongoose.model('UserIngredient', userIngredientSchema);
