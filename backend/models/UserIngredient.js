const mongoose = require('mongoose');

const stockLotSchema = new mongoose.Schema({
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  purchasedAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    required: true
  }
}, { _id: true });

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
  lots: {
    type: [stockLotSchema],
    default: []
  }
});

userIngredientSchema.index({ userId: 1, ingredientId: 1 }, { unique: true });

// Virtuel: quantite totale en sommant tous les lots
userIngredientSchema.virtual('quantity').get(function() {
  return this.lots.reduce((sum, lot) => sum + lot.quantity, 0);
});

// S'assure que les virtuels sont inclus dans le JSON
userIngredientSchema.set('toJSON', { virtuals: true });
userIngredientSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('UserIngredient', userIngredientSchema);
