const User = require('../models/User');
const { generateRandomOrder } = require('./orderGenerator');
const { handleOrderExpired } = require('./orderHandlers');
const {
  ORDER_INTERVAL_MIN,
  ORDER_INTERVAL_MAX,
  ORDER_TIMEOUT,
  FIRST_ORDER_DELAY
} = require('../config/constants');

// Sessions de service actives: userId -> { socket, orders, intervalId }
const activeSessions = new Map();

// Demarre la generation des commandes pour un utilisateur
function startSession(userId, socket) {
  stopSession(userId);

  const session = {
    socket,
    orders: new Map(),
    intervalId: null
  };

  const sendOrder = async () => {
    const user = await User.findById(userId);
    if (!user || !user.isServiceActive) {
      stopSession(userId);
      return;
    }

    const order = await generateRandomOrder();
    if (!order) return;

    const timeoutId = setTimeout(() => {
      if (session.orders.has(order.id)) {
        session.orders.delete(order.id);
        handleOrderExpired(userId, order, socket, stopSession);
      }
    }, ORDER_TIMEOUT);

    session.orders.set(order.id, { order, timeoutId });
    socket.emit('order:new', order);
    console.log(`[COMMANDE] Nouvelle commande pour ${userId}: ${order.recipeName}`);
  };

  // Premiere commande apres un court delai
  setTimeout(() => sendOrder(), FIRST_ORDER_DELAY);

  // Commandes suivantes a intervalles aleatoires
  const scheduleNext = () => {
    const delay = ORDER_INTERVAL_MIN + Math.random() * (ORDER_INTERVAL_MAX - ORDER_INTERVAL_MIN);
    session.intervalId = setTimeout(() => {
      sendOrder();
      scheduleNext();
    }, delay);
  };
  scheduleNext();

  activeSessions.set(userId, session);
  console.log(`[SERVICE] Demarre pour l'utilisateur ${userId}`);
}

// Arrete la generation des commandes pour un utilisateur
function stopSession(userId) {
  const session = activeSessions.get(userId);
  if (!session) return;

  if (session.intervalId) clearTimeout(session.intervalId);
  for (const [, { timeoutId }] of session.orders) {
    clearTimeout(timeoutId);
  }
  session.orders.clear();
  activeSessions.delete(userId);
  console.log(`[SERVICE] Arrete pour l'utilisateur ${userId}`);
}

// Recupere une session active
function getSession(userId) {
  return activeSessions.get(userId);
}

module.exports = { startSession, stopSession, getSession };
