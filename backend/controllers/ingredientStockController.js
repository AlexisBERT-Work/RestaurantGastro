const Ingredient = require('../models/Ingredient');
const UserIngredient = require('../models/UserIngredient');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const { DEFAULT_SHELF_LIFE } = require('../config/constants');

// Recupere tous les ingredients avec le stock utilisateur (lots FIFO)
exports.getUserStock = async (req, res) => {
  try {
    const ingredients = await Ingredient.find();
    const userStock = await UserIngredient.find({ userId: req.userId });

    const stockMap = {};
    const lotsMap = {};
    const now = new Date();

    userStock.forEach(ui => {
      const validLots = ui.lots
        .filter(lot => lot.expiresAt > now)
        .sort((a, b) => a.purchasedAt - b.purchasedAt);
      const totalQty = validLots.reduce((sum, lot) => sum + lot.quantity, 0);
      stockMap[ui.ingredientId.toString()] = totalQty;
      lotsMap[ui.ingredientId.toString()] = validLots.map(lot => ({
        quantity: lot.quantity,
        purchasedAt: lot.purchasedAt,
        expiresAt: lot.expiresAt
      }));
    });

    const result = ingredients.map(ing => ({
      _id: ing._id,
      name: ing.name,
      category: ing.category,
      description: ing.description,
      cost: ing.cost || 10,
      shelfLife: ing.shelfLife || DEFAULT_SHELF_LIFE,
      quantity: stockMap[ing._id.toString()] || 0,
      lots: lotsMap[ing._id.toString()] || []
    }));

    res.json({ ingredients: result });
  } catch (err) {
    console.error('Erreur de recuperation du stock utilisateur:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Achat d'un ingredient (cree un lot FIFO avec date d'expiration)
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

    // Deduit la tresorerie
    user.treasury = currentTreasury - totalCost;
    await user.save();

    // Calcule la date d'expiration basee sur la shelfLife (en nombre de services = heures de jeu)
    const shelfLifeHours = (ingredient.shelfLife || DEFAULT_SHELF_LIFE) * 1;
    const expiresAt = new Date(Date.now() + shelfLifeHours * 60 * 60 * 1000);

    // Cree un nouveau lot FIFO
    const newLot = {
      quantity,
      purchasedAt: new Date(),
      expiresAt
    };

    await UserIngredient.updateOne(
      { userId: req.userId, ingredientId },
      { $push: { lots: newLot } },
      { upsert: true }
    );

    // Cree une transaction
    const transaction = new Transaction({
      userId: req.userId,
      type: 'achat_ingredient',
      amount: -totalCost,
      description: `Achat de ${quantity}x ${ingredient.name}`,
      ingredientId: ingredient._id
    });
    await transaction.save();

    // Recupere le stock mis a jour
    const userIngredient = await UserIngredient.findOne({ userId: req.userId, ingredientId });
    const now = new Date();
    const validLots = userIngredient.lots.filter(l => l.expiresAt > now);
    const totalQuantity = validLots.reduce((sum, l) => sum + l.quantity, 0);

    res.json({
      message: `${quantity}x ${ingredient.name} achete(s)`,
      treasury: user.treasury,
      newQuantity: totalQuantity,
      expiresAt
    });
  } catch (err) {
    console.error('Erreur lors de l\'achat d\'ingredient:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};
