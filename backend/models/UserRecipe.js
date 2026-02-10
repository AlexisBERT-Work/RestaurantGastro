const mongoose = require('mongoose');

const userRecipeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Recipe',
    required: true
  },
  discovered: {
    type: Boolean,
    default: false
  },
  discoveredAt: {
    type: Date,
    default: null
  }
});

userRecipeSchema.index({ userId: 1, recipeId: 1 }, { unique: true });

module.exports = mongoose.model('UserRecipe', userRecipeSchema);
