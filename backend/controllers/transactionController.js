const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const Ingredient = require('../models/Ingredient');

// Get all transactions for user
exports.getTransactions = async (req, res) => {
  try {
    const { type, limit = 50, skip = 0 } = req.query;
    const filter = { userId: req.userId };
    if (type) filter.type = type;

    const transactions = await Transaction.find(filter)
      .sort({ createdAt: -1 })
      .skip(parseInt(skip))
      .limit(parseInt(limit))
      .populate('recipeId', 'name')
      .populate('ingredientId', 'name');

    res.json({ transactions });
  } catch (err) {
    console.error('Get transactions Error:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Get current treasury
exports.getTreasury = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('treasury');
    res.json({ treasury: user.treasury ?? 500 });
  } catch (err) {
    console.error('Get treasury Error:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Get treasury history for line chart
exports.getTreasuryHistory = async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.userId })
      .sort({ createdAt: 1 })
      .select('amount createdAt type description');

    let cumulative = 500;
    const history = transactions.map(t => {
      cumulative += t.amount;
      return {
        date: t.createdAt,
        treasury: cumulative,
        type: t.type,
        amount: t.amount,
        description: t.description
      };
    });

    res.json({ history });
  } catch (err) {
    console.error('Get treasury history Error:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Get expense breakdown for pie chart
exports.getExpenseBreakdown = async (req, res) => {
  try {
    const breakdown = await Transaction.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(req.userId), amount: { $lt: 0 } } },
      { $group: { _id: '$type', total: { $sum: { $abs: '$amount' } } } }
    ]);
    res.json({ breakdown });
  } catch (err) {
    console.error('Get expense breakdown Error:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Get profit per dish
exports.getProfitPerDish = async (req, res) => {
  try {
    const sales = await Transaction.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(req.userId), type: 'vente_plat' } },
      {
        $group: {
          _id: '$recipeId',
          totalRevenue: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $lookup: { from: 'recipes', localField: '_id', foreignField: '_id', as: 'recipe' } },
      { $unwind: '$recipe' }
    ]);

    const result = [];
    for (const sale of sales) {
      let ingredientCost = 0;
      for (const ing of sale.recipe.requiredIngredients) {
        const ingredient = await Ingredient.findOne({ name: ing.name });
        if (ingredient) ingredientCost += ingredient.cost || 10;
      }
      result.push({
        recipeName: sale.recipe.name,
        recipeId: sale._id,
        totalRevenue: sale.totalRevenue,
        ingredientCostPerServe: ingredientCost,
        timesSold: sale.count,
        netProfitPerServe: sale.recipe.price - ingredientCost,
        totalNetProfit: sale.totalRevenue - (ingredientCost * sale.count)
      });
    }

    res.json({ profitPerDish: result });
  } catch (err) {
    console.error('Get profit per dish Error:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};
