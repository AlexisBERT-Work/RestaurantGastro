const Recipe = require('../models/Recipe');
const Ingredient = require('../models/Ingredient');
const UserRecipe = require('../models/UserRecipe');

// Algo de matching: compare les ingrédients combinés avec les ingrédients requis de chaque recette
exports.experimentAndMatch = async (req, res) => {
  try {
    const { combinedIngredients } = req.body;
    const userId = req.userId;

    if (!combinedIngredients || combinedIngredients.length === 0) {
      return res.status(400).json({ message: 'Aucun ingredient fourni' });
    }

    // Get all recipes
    const recipes = await Recipe.find();

    let matchedRecipe = null;
    let matchScore = 0;

    // Check each recipe
    for (const recipe of recipes) {
      const requiredIngredientNames = recipe.requiredIngredients.map(ing => ing.name.toLowerCase());
      const combinedIngredientNames = combinedIngredients.map(ing => ing.toLowerCase());

      // Simple matching: check if all required ingredients are in combined ingredients
      const allPresent = requiredIngredientNames.every(required => 
        combinedIngredientNames.includes(required)
      );

      if (allPresent) {
        matchedRecipe = recipe;
        matchScore = requiredIngredientNames.length;
        break;
      }
    }

    if (matchedRecipe) {
      // Recipe found! Save as discovered
      await UserRecipe.updateOne(
        { userId, recipeId: matchedRecipe._id },
        { discovered: true, discoveredAt: new Date() },
        { upsert: true }
      );

      return res.json({
        success: true,
        message: `Recette decouverte ! "${matchedRecipe.name}"`,
        recipe: matchedRecipe
      });
    } else {
      // No match
      return res.json({
        success: false,
        message: 'Combinaison invalide. Ingredients detruits !'
      });
    }
  } catch (err) {
    console.error('Experiment Error:', err);
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

// Get all available recipes for experimentation
exports.getAllRecipes = async (req, res) => {
  try {
    const recipes = await Recipe.find();
    res.json({ recipes });
  } catch (err) {
    console.error('Get recipes Error:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Get user's discovered recipes
exports.getUserRecipes = async (req, res) => {
  try {
    const userId = req.userId;
    const userRecipes = await UserRecipe.find({ userId, discovered: true })
      .populate('recipeId');
    
    res.json({ recipes: userRecipes.map(ur => ur.recipeId).filter(r => r !== null) });
  } catch (err) {
    console.error('Get user recipes Error:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};
