const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { startSession, stopSession, getSession } = require('./sessionManager');
const { handleServeOrder, handleRejectOrder } = require('./orderHandlers');
const { INITIAL_SATISFACTION, INITIAL_TREASURY, INITIAL_STARS } = require('../config/constants');

// Middleware d'authentification Socket.io
function configureAuth(io) {
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Authentification requise'));

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch (err) {
      return next(new Error('Token invalide'));
    }
  });
}

// Configure tous les evenements Socket.io
function configureEvents(io) {
  io.on('connection', (socket) => {
    const userId = socket.userId;
    console.log(`[SOCKET] Client connecte: ${socket.id} (user: ${userId})`);

    // Demarrer le service
    socket.on('service:start', async () => {
      try {
        const user = await User.findById(userId);
        if (!user) return;

        user.satisfaction = INITIAL_SATISFACTION;
        user.isServiceActive = true;
        user.stars = user.stars ?? INITIAL_STARS;
        await user.save();

        socket.emit('service:started', {
          satisfaction: INITIAL_SATISFACTION,
          treasury: user.treasury ?? INITIAL_TREASURY,
          stars: user.stars
        });
        startSession(userId, socket);
      } catch (err) {
        console.error('Erreur de demarrage du service:', err);
        socket.emit('service:error', { message: 'Echec du demarrage du service' });
      }
    });

    // Arreter le service
    socket.on('service:stop', async () => {
      try {
        const user = await User.findById(userId);
        if (user) {
          user.isServiceActive = false;
          await user.save();
        }
        stopSession(userId);
        socket.emit('service:stopped', { message: 'Service arrete' });
      } catch (err) {
        console.error('Erreur d\'arret du service:', err);
      }
    });

    // Servir une commande
    socket.on('order:serve', async ({ orderId, recipeId }) => {
      try {
        const session = getSession(userId);
        if (!session) {
          socket.emit('order:serve_result', {
            success: false,
            message: 'Le service n\'est pas actif'
          });
          return;
        }
        await handleServeOrder(userId, orderId, recipeId, session, socket, stopSession);
      } catch (err) {
        console.error('Erreur lors du service de la commande:', err);
        socket.emit('order:serve_result', {
          success: false,
          message: 'Erreur serveur lors du service de la commande'
        });
      }
    });

    // Rejeter une commande
    socket.on('order:reject', async ({ orderId }) => {
      try {
        const session = getSession(userId);
        if (!session) return;
        await handleRejectOrder(userId, orderId, session, socket, stopSession);
      } catch (err) {
        console.error('Erreur lors du rejet de la commande:', err);
      }
    });

    // Deconnexion
    socket.on('disconnect', () => {
      console.log(`[SOCKET] Client deconnecte: ${socket.id} (user: ${userId})`);
      stopSession(userId);
    });
  });
}

// Point d'entree: initialise Socket.io sur le serveur
function initSocket(io) {
  configureAuth(io);
  configureEvents(io);
}

module.exports = initSocket;
