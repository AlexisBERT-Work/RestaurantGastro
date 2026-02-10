const User = require('../models/User');
const Recipe = require('../models/Recipe');
const UserRecipe = require('../models/UserRecipe');

// Get user's service state (satisfaction, active status)
exports.getServiceState = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('satisfaction isServiceActive restaurantName');
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouve' });
    }
    res.json({
      satisfaction: user.satisfaction,
      isServiceActive: user.isServiceActive,
      restaurantName: user.restaurantName
    });
  } catch (err) {
    console.error('Get service state error:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Start service session
exports.startService = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouve' });
    }

    // Reset satisfaction to 20 when starting a new service
    user.satisfaction = 20;
    user.isServiceActive = true;
    await user.save();

    res.json({
      message: 'Service demarre !',
      satisfaction: user.satisfaction
    });
  } catch (err) {
    console.error('Start service error:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Stop service session
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
    console.error('Stop service error:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Serve an order — called when user clicks "Serve"
exports.serveOrder = async (req, res) => {
  try {
    const { recipeId } = req.body;
    const userId = req.userId;

    if (!recipeId) {
      return res.status(400).json({ message: 'ID de recette requis' });
    }

    // Check recipe exists
    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
      return res.status(404).json({ message: 'Recette non trouvee' });
    }

    // Check user has discovered this recipe
    const userRecipe = await UserRecipe.findOne({
      userId,
      recipeId,
      discovered: true
    });

    if (!userRecipe) {
      return res.status(400).json({
        message: 'Vous n\'avez pas encore decouvert cette recette !'
      });
    }

    // Serve success: +1 satisfaction
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
    console.error('Serve order error:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Get user's discovered recipe IDs (for quick check in service)
exports.getDiscoveredRecipeIds = async (req, res) => {
  try {
    const userRecipes = await UserRecipe.find({
      userId: req.userId,
      discovered: true
    }).select('recipeId');

    const recipeIds = userRecipes.map(ur => ur.recipeId.toString());
    res.json({ recipeIds });
  } catch (err) {
    console.error('Get discovered IDs error:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};
