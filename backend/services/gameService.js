const User = require('../models/User');
const Transaction = require('../models/Transaction');
const {
  PENALTY_AMOUNT,
  SATISFACTION_PENALTY,
  SATISFACTION_REWARD,
  INITIAL_TREASURY,
  VIP_PENALTY_AMOUNT,
  VIP_SATISFACTION_PENALTY,
  VIP_SATISFACTION_REWARD,
  INITIAL_STARS
} = require('../config/constants');

// Applique une penalite (commande expiree ou rejetee)
async function applyPenalty(userId, description) {
  const user = await User.findById(userId);
  if (!user) return null;

  user.satisfaction -= SATISFACTION_PENALTY;
  user.treasury = (user.treasury ?? INITIAL_TREASURY) - PENALTY_AMOUNT;
  await user.save();

  await new Transaction({
    userId,
    type: 'penalite',
    amount: -PENALTY_AMOUNT,
    description
  }).save();

  return user;
}

// Applique une penalite VIP (perte d'etoile + grosse penalite)
async function applyVipPenalty(userId, description) {
  const user = await User.findById(userId);
  if (!user) return null;

  user.satisfaction -= VIP_SATISFACTION_PENALTY;
  user.treasury = (user.treasury ?? INITIAL_TREASURY) - VIP_PENALTY_AMOUNT;
  user.stars = Math.max(0, (user.stars ?? INITIAL_STARS) - 1);
  await user.save();

  await new Transaction({
    userId,
    type: 'penalite',
    amount: -VIP_PENALTY_AMOUNT,
    description
  }).save();

  return user;
}

// Enregistre une vente reussie
async function recordSale(userId, recipeName, recipeId, revenue) {
  const user = await User.findById(userId);
  if (!user) return null;

  user.satisfaction += SATISFACTION_REWARD;
  user.treasury = (user.treasury ?? INITIAL_TREASURY) + revenue;
  await user.save();

  await new Transaction({
    userId,
    type: 'vente_plat',
    amount: revenue,
    description: `Vente de ${recipeName}`,
    recipeId
  }).save();

  return user;
}

// Enregistre une vente VIP reussie (gros bonus de satisfaction)
async function recordVipSale(userId, recipeName, recipeId, revenue) {
  const user = await User.findById(userId);
  if (!user) return null;

  user.satisfaction += VIP_SATISFACTION_REWARD;
  user.treasury = (user.treasury ?? INITIAL_TREASURY) + revenue;
  await user.save();

  await new Transaction({
    userId,
    type: 'vente_plat',
    amount: revenue,
    description: `Vente VIP de ${recipeName}`,
    recipeId
  }).save();

  return user;
}

// Verifie si la partie est terminee (satisfaction/tresorerie < 0 OU etoiles = 0)
function isGameOver(user) {
  return user.satisfaction < 0 || user.treasury < 0 || (user.stars ?? INITIAL_STARS) <= 0;
}

// Genere le message de fin de partie
function getGameOverMessage(user) {
  if ((user.stars ?? INITIAL_STARS) <= 0) {
    return 'Fin de partie ! Vous avez perdu toutes vos etoiles ! Le critique vous a retire du guide.';
  }
  return user.treasury < 0
    ? 'Fin de partie ! La tresorerie est tombee en dessous de 0 !'
    : 'Fin de partie ! La satisfaction est tombee en dessous de 0 !';
}

// Desactive le service pour un utilisateur
async function deactivateService(userId) {
  await User.findByIdAndUpdate(userId, { isServiceActive: false });
}

module.exports = {
  applyPenalty,
  applyVipPenalty,
  recordSale,
  recordVipSale,
  isGameOver,
  getGameOverMessage,
  deactivateService
};
