const User = require('../models/User');
const Recipe = require('../models/Recipe');
const UserRecipe = require('../models/UserRecipe');
const { checkAndPrepareStock, consumeStock, formatStockError } = require('../services/stockService');
const {
  applyPenalty,
  applyVipPenalty,
  recordSale,
  recordVipSale,
  isGameOver,
  getGameOverMessage,
  deactivateService
} = require('../services/gameService');
const {
  PENALTY_AMOUNT,
  SATISFACTION_PENALTY,
  VIP_PENALTY_AMOUNT,
  VIP_SATISFACTION_PENALTY,
  VIP_SATISFACTION_REWARD,
  DEFAULT_RECIPE_PRICE,
  INITIAL_SATISFACTION,
  INITIAL_STARS
} = require('../config/constants');

// Gere l'expiration d'une commande (normale ou VIP)
async function handleOrderExpired(userId, order, socket, stopSession) {
  try {
    const isVip = order.isVip || false;
    let user;

    if (isVip) {
      user = await applyVipPenalty(userId, `Penalite VIP : commande expiree (${order.recipeName})`);
    } else {
      user = await applyPenalty(userId, `Penalite : commande expiree (${order.recipeName})`);
    }

    if (!user || !user.isServiceActive) return;

    const penaltyMsg = isVip
      ? `Commande VIP expiree : ${order.recipeName} ! (-${VIP_SATISFACTION_PENALTY} satisfaction, -${VIP_PENALTY_AMOUNT}G, -1 etoile)`
      : `Commande expiree : ${order.recipeName} ! (-${SATISFACTION_PENALTY} satisfaction, -${PENALTY_AMOUNT}G)`;

    socket.emit('order:expired', {
      orderId: order.id,
      recipeName: order.recipeName,
      isVip,
      satisfaction: user.satisfaction,
      treasury: user.treasury,
      stars: user.stars ?? INITIAL_STARS,
      message: penaltyMsg
    });

    if (isGameOver(user)) {
      socket.emit('service:gameover', {
        satisfaction: user.satisfaction,
        treasury: user.treasury,
        stars: user.stars ?? INITIAL_STARS,
        message: getGameOverMessage(user)
      });
      stopSession(userId);
      await deactivateService(userId);
    }
  } catch (err) {
    console.error('Erreur de gestion de l\'expiration de commande:', err);
  }
}

// Gere le service d'une commande par le joueur
async function handleServeOrder(userId, orderId, recipeId, session, socket, stopSession) {
  const orderEntry = session.orders.get(orderId);
  if (!orderEntry) {
    socket.emit('order:serve_result', {
      success: false,
      orderId,
      message: 'Cette commande a deja expire ou n\'existe pas'
    });
    return;
  }

  const isVip = orderEntry.order.isVip || false;

  // Double verification d'expiration
  if (Date.now() > orderEntry.order.expiresAt) {
    session.orders.delete(orderId);
    clearTimeout(orderEntry.timeoutId);

    let user;
    if (isVip) {
      user = await applyVipPenalty(userId, `Penalite VIP : commande expiree (${orderEntry.order.recipeName})`);
    } else {
      user = await applyPenalty(userId, `Penalite : commande expiree (${orderEntry.order.recipeName})`);
    }

    const penaltyMsg = isVip
      ? `Trop tard ! Commande VIP expiree. (-${VIP_SATISFACTION_PENALTY} satisfaction, -${VIP_PENALTY_AMOUNT}G, -1 etoile)`
      : `Trop tard ! Commande expiree. (-${SATISFACTION_PENALTY} satisfaction, -${PENALTY_AMOUNT}G)`;

    socket.emit('order:serve_result', {
      success: false, orderId, isVip,
      satisfaction: user.satisfaction,
      treasury: user.treasury,
      stars: user.stars ?? INITIAL_STARS,
      message: penaltyMsg
    });

    if (isGameOver(user)) {
      socket.emit('service:gameover', {
        satisfaction: user.satisfaction, treasury: user.treasury,
        stars: user.stars ?? INITIAL_STARS,
        message: getGameOverMessage(user)
      });
      stopSession(userId);
      await deactivateService(userId);
    }
    return;
  }

  // Verifie que la recette est decouverte
  const userRecipe = await UserRecipe.findOne({ userId, recipeId, discovered: true });
  if (!userRecipe) {
    socket.emit('order:serve_result', {
      success: false, orderId,
      message: 'Vous n\'avez pas encore decouvert cette recette ! Allez au Laboratoire.'
    });
    return;
  }

  // Verifie le stock d'ingredients
  const recipe = await Recipe.findById(recipeId);
  if (!recipe) {
    socket.emit('order:serve_result', {
      success: false, orderId,
      message: 'Recette introuvable'
    });
    return;
  }

  const stockCheck = await checkAndPrepareStock(userId, recipe.requiredIngredients);
  if (!stockCheck.ok) {
    socket.emit('order:serve_result', {
      success: false, orderId,
      message: formatStockError(stockCheck.insufficientStock)
    });
    return;
  }

  // Consomme le stock (FIFO)
  await consumeStock(userId, stockCheck.ingredientUpdates);

  // Valide la commande
  clearTimeout(orderEntry.timeoutId);
  session.orders.delete(orderId);

  const revenue = orderEntry.order.price || DEFAULT_RECIPE_PRICE;
  let user;

  if (isVip) {
    user = await recordVipSale(userId, orderEntry.order.recipeName, orderEntry.order.recipeId, revenue);
  } else {
    user = await recordSale(userId, orderEntry.order.recipeName, orderEntry.order.recipeId, revenue);
  }

  const successMsg = isVip
    ? `Commande VIP servie : ${orderEntry.order.recipeName} ! (+${VIP_SATISFACTION_REWARD} satisfaction, +${revenue}G)`
    : `Commande servie : ${orderEntry.order.recipeName} ! (+1 satisfaction, +${revenue}G)`;

  socket.emit('order:serve_result', {
    success: true, orderId, isVip,
    recipeName: orderEntry.order.recipeName,
    satisfaction: user.satisfaction,
    treasury: user.treasury,
    stars: user.stars ?? INITIAL_STARS,
    revenue,
    message: successMsg
  });

  console.log(`[SERVI${isVip ? ' VIP' : ''}] Par ${userId}: ${orderEntry.order.recipeName} | Satisfaction: ${user.satisfaction} | Tresorerie: ${user.treasury} | Etoiles: ${user.stars}`);
}

// Gere le rejet d'une commande par le joueur
async function handleRejectOrder(userId, orderId, session, socket, stopSession) {
  const orderEntry = session.orders.get(orderId);
  if (!orderEntry) return;

  clearTimeout(orderEntry.timeoutId);
  session.orders.delete(orderId);

  const isVip = orderEntry.order.isVip || false;
  let user;

  if (isVip) {
    user = await applyVipPenalty(userId, `Penalite VIP : commande rejetee (${orderEntry.order.recipeName})`);
  } else {
    user = await applyPenalty(userId, `Penalite : commande rejetee (${orderEntry.order.recipeName})`);
  }

  const penaltyMsg = isVip
    ? `Commande VIP rejetee : ${orderEntry.order.recipeName} ! (-${VIP_SATISFACTION_PENALTY} satisfaction, -${VIP_PENALTY_AMOUNT}G, -1 etoile)`
    : `Commande rejetee : ${orderEntry.order.recipeName} ! (-${SATISFACTION_PENALTY} satisfaction, -${PENALTY_AMOUNT}G)`;

  socket.emit('order:rejected', {
    orderId, isVip,
    recipeName: orderEntry.order.recipeName,
    satisfaction: user.satisfaction,
    treasury: user.treasury,
    stars: user.stars ?? INITIAL_STARS,
    message: penaltyMsg
  });

  if (isGameOver(user)) {
    socket.emit('service:gameover', {
      satisfaction: user.satisfaction,
      treasury: user.treasury,
      stars: user.stars ?? INITIAL_STARS,
      message: getGameOverMessage(user)
    });
    stopSession(userId);
    await deactivateService(userId);
  }
}

module.exports = { handleOrderExpired, handleServeOrder, handleRejectOrder };
