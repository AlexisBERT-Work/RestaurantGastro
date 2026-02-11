const Ingredient = require('../models/Ingredient');
const UserIngredient = require('../models/UserIngredient');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

// Get all ingredients with user's current stock
exports.getUserStock = async (req, res) => {
  try {
    const ingredients = await Ingredient.find();
    const userStock = await UserIngredient.find({ userId: req.userId });

    const stockMap = {};
    userStock.forEach(ui => {
      stockMap[ui.ingredientId.toString()] = ui.quantity;
    });

    const result = ingredients.map(ing => ({
      _id: ing._id,
      name: ing.name,
      category: ing.category,
      description: ing.description,
      cost: ing.cost || 10,
      quantity: stockMap[ing._id.toString()] || 0
    }));

    res.json({ ingredients: result });
  } catch (err) {
    console.error('Get user stock Error:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Purchase an ingredient
exports.purchaseIngredient = async (req, res) => {
  try {
    const { ingredientId, quantity = 1 } = req.body;

    if (!ingredientId || quantity < 1) {
      return res.status(400).json({ message: 'ID ingredient et quantite requis' });
    }

    const ingredient = await Ingredient.findById(ingredientId);
    if (!ingredient) {
      return res.status(404).json({ message: 'Ingredient non trouve' });
    }

    const totalCost = (ingredient.cost || 10) * quantity;

    const user = await User.findById(req.userId);
    const currentTreasury = user.treasury ?? 500;

    if (currentTreasury < totalCost) {
      return res.status(400).json({
        message: 'Tresorerie insuffisante',
        treasury: currentTreasury,
        cost: totalCost
      });
    }

    // Deduct treasury
    user.treasury = currentTreasury - totalCost;
    await user.save();

    // Add stock
    await UserIngredient.updateOne(
      { userId: req.userId, ingredientId },
      { $inc: { quantity } },
      { upsert: true }
    );

    // Create transaction
    const transaction = new Transaction({
      userId: req.userId,
      type: 'achat_ingredient',
      amount: -totalCost,
      description: `Achat de ${quantity}x ${ingredient.name}`,
      ingredientId: ingredient._id
    });
    await transaction.save();

    // Get updated stock
    const userIngredient = await UserIngredient.findOne({ userId: req.userId, ingredientId });

    res.json({
      message: `${quantity}x ${ingredient.name} achete(s)`,
      treasury: user.treasury,
      newQuantity: userIngredient.quantity
    });
  } catch (err) {
    console.error('Purchase ingredient Error:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};
