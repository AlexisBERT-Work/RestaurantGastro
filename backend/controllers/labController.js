const Recipe = require('../models/Recipe');
const UserRecipe = require('../models/UserRecipe');
const { checkAndPrepareStock, consumeStock } = require('../services/stockService');

// Convertit une liste de noms d'ingredients en format requiredIngredients [{name, quantity}]
function aggregateIngredients(names) {
  const counts = {};
  for (const name of names) {
    const lower = name.toLowerCase();
    counts[lower] = (counts[lower] || 0) + 1;
  }
  return Object.entries(counts).map(([name, quantity]) => ({ name, quantity }));
}

// Algo de matching: compare les ingredients combines avec les ingredients requis
exports.experimentAndMatch = async (req, res) => {
  try {
    const { combinedIngredients } = req.body;
    const userId = req.userId;

    if (!combinedIngredients || combinedIngredients.length === 0) {
      return res.status(400).json({ message: 'Aucun ingredient fourni' });
    }

    // Agrege et verifie le stock via stockService
    const required = aggregateIngredients(combinedIngredients);
    const stockCheck = await checkAndPrepareStock(userId, required);

    if (!stockCheck.ok) {
      return res.status(400).json({
        message: 'Stock insuffisant pour certains ingredients',
        insufficientStock: stockCheck.insufficientStock
      });
    }

    // Consomme les ingredients du stock
    await consumeStock(userId, stockCheck.ingredientUpdates);

    // Recupere toutes les recettes
    const recipes = await Recipe.find();

    let matchedRecipe = null;

    // Verifie chaque recette
    for (const recipe of recipes) {
      const requiredNames = recipe.requiredIngredients.map(ing => ing.name.toLowerCase());
      const combinedNames = combinedIngredients.map(ing => ing.toLowerCase());

      // Matching simple: verifie que tous les ingredients requis sont presents
      if (requiredNames.every(r => combinedNames.includes(r))) {
        matchedRecipe = recipe;
        break;
      }
    }

    if (matchedRecipe) {
      // Recette trouvee: sauvegarde en tant que decouverte
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
      return res.json({
        success: false,
        message: 'Combinaison invalide. Ingredients detruits !'
      });
    }
  } catch (err) {
    console.error('Erreur lors de l\'experience:', err);
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

// Recupere toutes les recettes disponibles pour experimentation
exports.getAllRecipes = async (req, res) => {
  try {
    const recipes = await Recipe.find();
    res.json({ recipes });
  } catch (err) {
    console.error('Erreur de recuperation des recettes:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Recupere les recettes decouvertes par l'utilisateur
exports.getUserRecipes = async (req, res) => {
  try {
    const userId = req.userId;
    const userRecipes = await UserRecipe.find({ userId, discovered: true })
      .populate('recipeId');
    
    res.json({ recipes: userRecipes.map(ur => ur.recipeId).filter(r => r !== null) });
  } catch (err) {
    console.error('Erreur de recuperation des recettes utilisateur:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};
