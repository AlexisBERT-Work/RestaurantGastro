const User = require('../models/User');
const Recipe = require('../models/Recipe');
const UserRecipe = require('../models/UserRecipe');
const { checkAndPrepareStock, consumeStock, formatStockError } = require('../services/stockService');

// Recupere l'etat du service (satisfaction, actif)
exports.getServiceState = async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .select('satisfaction isServiceActive restaurantName treasury stars');

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouve' });
    }

    res.json({
      satisfaction: user.satisfaction,
      isServiceActive: user.isServiceActive,
      restaurantName: user.restaurantName,
      treasury: user.treasury ?? 500,
      stars: user.stars ?? 3
    });
  } catch (err) {
    console.error('Erreur de recuperation de l\'etat du service:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Demarre une session de service
exports.startService = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouve' });
    }

    user.satisfaction = 20;
    user.isServiceActive = true;
    await user.save();

    res.json({
      message: 'Service demarre !',
      satisfaction: user.satisfaction
    });
  } catch (err) {
    console.error('Erreur de demarrage du service:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Arrete la session de service
exports.stopService = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouve' });
    }

    user.isServiceActive = false;
    await user.save();

    res.json({
      message: 'Service arrete',
      satisfaction: user.satisfaction
    });
  } catch (err) {
    console.error('Erreur d\'arret du service:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Sert une commande (appele quand l'utilisateur clique sur "Servir")
exports.serveOrder = async (req, res) => {
  try {
    const { recipeId } = req.body;
    const userId = req.userId;

    if (!recipeId) {
      return res.status(400).json({ message: 'ID de recette requis' });
    }

    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
      return res.status(404).json({ message: 'Recette non trouvee' });
    }

    // Verifie que la recette est decouverte
    const userRecipe = await UserRecipe.findOne({ userId, recipeId, discovered: true });
    if (!userRecipe) {
      return res.status(400).json({
        message: 'Vous n\'avez pas encore decouvert cette recette !'
      });
    }

    // Verifie et prepare le stock
    const stockCheck = await checkAndPrepareStock(userId, recipe.requiredIngredients);
    if (!stockCheck.ok) {
      return res.status(400).json({
        message: formatStockError(stockCheck.insufficientStock)
      });
    }

    await consumeStock(userId, stockCheck.ingredientUpdates);

    // Succes du service
    const user = await User.findById(userId);
    user.satisfaction += 1;
    await user.save();

    res.json({
      success: true,
      message: `Commande servie : ${recipe.name} ! (+1 satisfaction)`,
      satisfaction: user.satisfaction,
      recipeName: recipe.name
    });
  } catch (err) {
    console.error('Erreur lors du service de la commande:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Recupere les IDs des recettes decouvertes
exports.getDiscoveredRecipeIds = async (req, res) => {
  try {
    const userRecipes = await UserRecipe.find({
      userId: req.userId,
      discovered: true
    }).select('recipeId');

    const recipeIds = userRecipes.map(ur => ur.recipeId.toString());
    res.json({ recipeIds });
  } catch (err) {
    console.error('Erreur de recuperation des IDs decouverts:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};
