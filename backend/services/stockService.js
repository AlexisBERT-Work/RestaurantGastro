const Ingredient = require('../models/Ingredient');
const UserIngredient = require('../models/UserIngredient');

// Verifie si l'utilisateur a assez de stock pour une recette (FIFO)
// Ne compte que les lots non perimes
// Retourne { ok, insufficientStock, ingredientUpdates }
async function checkAndPrepareStock(userId, requiredIngredients) {
  const insufficientStock = [];
  const ingredientUpdates = [];

  for (const reqIng of requiredIngredients) {
    const ingredient = await Ingredient.findOne({
      name: { $regex: new RegExp(`^${reqIng.name}$`, 'i') }
    });

    if (!ingredient) {
      insufficientStock.push({ name: reqIng.name, needed: reqIng.quantity, available: 0 });
      continue;
    }

    const userIng = await UserIngredient.findOne({ userId, ingredientId: ingredient._id });
    // Filtre les lots non perimes et trie par date d'achat (FIFO : plus ancien en premier)
    const validLots = userIng
      ? userIng.lots
          .filter(lot => lot.expiresAt > new Date())
          .sort((a, b) => a.purchasedAt - b.purchasedAt)
      : [];

    const available = validLots.reduce((sum, lot) => sum + lot.quantity, 0);

    if (available < reqIng.quantity) {
      insufficientStock.push({ name: reqIng.name, needed: reqIng.quantity, available });
    } else {
      ingredientUpdates.push({
        ingredientId: ingredient._id,
        quantity: reqIng.quantity
      });
    }
  }

  return { ok: insufficientStock.length === 0, insufficientStock, ingredientUpdates };
}

// Consomme les ingredients du stock utilisateur en FIFO (lots les plus anciens d'abord)
async function consumeStock(userId, ingredientUpdates) {
  for (const update of ingredientUpdates) {
    const userIng = await UserIngredient.findOne({ userId, ingredientId: update.ingredientId });
    if (!userIng) continue;

    // Trie les lots par date d'achat (FIFO)
    const sortedLots = userIng.lots
      .filter(lot => lot.expiresAt > new Date())
      .sort((a, b) => a.purchasedAt - b.purchasedAt);

    let remaining = update.quantity;
    const lotsToRemove = [];

    for (const lot of sortedLots) {
      if (remaining <= 0) break;

      if (lot.quantity <= remaining) {
        // Consomme tout le lot
        remaining -= lot.quantity;
        lotsToRemove.push(lot._id);
      } else {
        // Consomme une partie du lot
        lot.quantity -= remaining;
        remaining = 0;
      }
    }

    // Supprime les lots entierement consommes
    userIng.lots = userIng.lots.filter(lot => !lotsToRemove.includes(lot._id));
    await userIng.save();
  }
}

// Supprime les lots perimes pour tous les utilisateurs
async function removeExpiredLots() {
  const now = new Date();
  const result = await UserIngredient.updateMany(
    {},
    { $pull: { lots: { expiresAt: { $lte: now } } } }
  );
  return result.modifiedCount;
}

// Formate un message d'erreur lisible depuis la liste de stock insuffisant
function formatStockError(insufficientStock) {
  const details = insufficientStock
    .map(s => `${s.name} (${s.available}/${s.needed})`)
    .join(', ');
  return `Stock insuffisant : ${details}. Achetez des ingredients au Marche !`;
}

module.exports = { checkAndPrepareStock, consumeStock, formatStockError, removeExpiredLots };
