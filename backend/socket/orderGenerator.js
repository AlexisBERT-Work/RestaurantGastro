const Recipe = require('../models/Recipe');
const {
  ORDER_TIMEOUT,
  DEFAULT_RECIPE_PRICE,
  VIP_CHANCE,
  VIP_BONUS_MULTIPLIER,
  VIP_ORDER_TIMEOUT
} = require('../config/constants');

// Genere une commande aleatoire depuis les recettes en base
// Peut generer une commande VIP avec une probabilite VIP_CHANCE
async function generateRandomOrder() {
  const allRecipes = await Recipe.find();
  if (allRecipes.length === 0) return null;

  const recipe = allRecipes[Math.floor(Math.random() * allRecipes.length)];
  const isVip = Math.random() < VIP_CHANCE;
  const basePrice = recipe.price || DEFAULT_RECIPE_PRICE;
  const timeout = isVip ? VIP_ORDER_TIMEOUT : ORDER_TIMEOUT;

  return {
    id: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    recipeId: recipe._id.toString(),
    recipeName: recipe.name,
    difficulty: recipe.difficulty,
    price: isVip ? basePrice * VIP_BONUS_MULTIPLIER : basePrice,
    requiredIngredients: recipe.requiredIngredients || [],
    isVip,
    createdAt: Date.now(),
    expiresAt: Date.now() + timeout,
    timeLimit: timeout
  };
}

module.exports = { generateRandomOrder };
