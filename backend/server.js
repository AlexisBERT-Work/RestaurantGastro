require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');

const Recipe = require('./models/Recipe');
const User = require('./models/User');
const UserRecipe = require('./models/UserRecipe');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('[OK] MongoDB Connected');
}).catch((err) => {
  console.error('[ERREUR] MongoDB Connection Error:', err);
  process.exit(1);
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/lab', require('./routes/lab'));
app.use('/api/recipes', require('./routes/recipes'));
app.use('/api/service', require('./routes/service'));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Serveur en cours d\'execution' });
});

// ========== SOCKET.IO - SERVICE EN TEMPS RÉEL ==========

// Store active service sessions: userId -> { interval, socket, orders }
const activeSessions = new Map();

// Order generation config
const ORDER_INTERVAL_MIN = 5000;  // Min time between orders (ms)
const ORDER_INTERVAL_MAX = 12000; // Max time between orders (ms)
const ORDER_TIMEOUT = 30000;      // Time before order expires (ms)

// Authenticate socket connection via JWT
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error('Authentication required'));
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.id;
    next();
  } catch (err) {
    return next(new Error('Invalid token'));
  }
});

// Generate a random order from known recipes
async function generateRandomOrder(userId) {
  try {
    const allRecipes = await Recipe.find();
    if (allRecipes.length === 0) return null;

    // Pick a random recipe
    const recipe = allRecipes[Math.floor(Math.random() * allRecipes.length)];
    
    const order = {
      id: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      recipeId: recipe._id.toString(),
      recipeName: recipe.name,
      difficulty: recipe.difficulty,
      price: recipe.price || 50,
      createdAt: Date.now(),
      expiresAt: Date.now() + ORDER_TIMEOUT,
      timeLimit: ORDER_TIMEOUT
    };

    return order;
  } catch (err) {
    console.error('Error generating order:', err);
    return null;
  }
}

// Handle order expiration (client was too slow)
async function handleOrderExpired(userId, order, socket) {
  try {
    const user = await User.findById(userId);
    if (!user || !user.isServiceActive) return;

    // -10 satisfaction for expired order
    user.satisfaction -= 10;
    await user.save();

    socket.emit('order:expired', {
      orderId: order.id,
      recipeName: order.recipeName,
      satisfaction: user.satisfaction,
      message: `Commande expiree : ${order.recipeName} ! (-10 satisfaction)`
    });

    // Check game over
    if (user.satisfaction < 0) {
      socket.emit('service:gameover', {
        satisfaction: user.satisfaction,
        message: 'Game Over ! La satisfaction est tombee en dessous de 0 !'
      });
      // Stop service
      stopServiceSession(userId);
      user.isServiceActive = false;
      await user.save();
    }
  } catch (err) {
    console.error('Handle order expired error:', err);
  }
}

// Start generating orders for a user
function startServiceSession(userId, socket) {
  // Clean up any existing session
  stopServiceSession(userId);

  const session = {
    socket,
    orders: new Map(), // orderId -> { order, timeout }
    intervalId: null
  };

  // Function to send a new order
  const sendOrder = async () => {
    const user = await User.findById(userId);
    if (!user || !user.isServiceActive) {
      stopServiceSession(userId);
      return;
    }

    const order = await generateRandomOrder(userId);
    if (!order) return;

    // Set expiration timeout
    const timeoutId = setTimeout(() => {
      if (session.orders.has(order.id)) {
        session.orders.delete(order.id);
        handleOrderExpired(userId, order, socket);
      }
    }, ORDER_TIMEOUT);

    session.orders.set(order.id, { order, timeoutId });

    socket.emit('order:new', order);
    console.log(`[COMMANDE] Nouvelle commande pour ${userId}: ${order.recipeName}`);
  };

  // Send first order quickly
  setTimeout(() => sendOrder(), 2000);

  // Then send orders at random intervals
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

// Stop order generation for a user
function stopServiceSession(userId) {
  const session = activeSessions.get(userId);
  if (session) {
    if (session.intervalId) clearTimeout(session.intervalId);
    // Clear all pending order timeouts
    for (const [, { timeoutId }] of session.orders) {
      clearTimeout(timeoutId);
    }
    session.orders.clear();
    activeSessions.delete(userId);
    console.log(`[SERVICE] Arrete pour l'utilisateur ${userId}`);
  }
}

io.on('connection', (socket) => {
  const userId = socket.userId;
  console.log(`[SOCKET] Client connecte: ${socket.id} (user: ${userId})`);

  // Client requests to start the service
  socket.on('service:start', async () => {
    try {
      const user = await User.findById(userId);
      if (!user) return;

      user.satisfaction = 20;
      user.isServiceActive = true;
      await user.save();

      socket.emit('service:started', { satisfaction: 20 });
      startServiceSession(userId, socket);
    } catch (err) {
      console.error('Service start error:', err);
      socket.emit('service:error', { message: 'Echec du demarrage du service' });
    }
  });

  // Client requests to stop the service
  socket.on('service:stop', async () => {
    try {
      const user = await User.findById(userId);
      if (user) {
        user.isServiceActive = false;
        await user.save();
      }
      stopServiceSession(userId);
      socket.emit('service:stopped', { message: 'Service arrete' });
    } catch (err) {
      console.error('Service stop error:', err);
    }
  });

  // Client tries to serve an order
  socket.on('order:serve', async ({ orderId, recipeId }) => {
    try {
      const session = activeSessions.get(userId);
      if (!session) {
        socket.emit('order:serve_result', {
          success: false,
          message: 'Le service n\'est pas actif'
        });
        return;
      }

      const orderEntry = session.orders.get(orderId);
      if (!orderEntry) {
        socket.emit('order:serve_result', {
          success: false,
          orderId,
          message: 'Cette commande a deja expire ou n\'existe pas'
        });
        return;
      }

      // Check if order has expired (double-check)
      if (Date.now() > orderEntry.order.expiresAt) {
        session.orders.delete(orderId);
        clearTimeout(orderEntry.timeoutId);
        
        const user = await User.findById(userId);
        user.satisfaction -= 10;
        await user.save();

        socket.emit('order:serve_result', {
          success: false,
          orderId,
          satisfaction: user.satisfaction,
          message: `Trop tard ! Commande expiree. (-10 satisfaction)`
        });

        if (user.satisfaction < 0) {
          socket.emit('service:gameover', {
            satisfaction: user.satisfaction,
            message: 'Game Over ! La satisfaction est tombee en dessous de 0 !'
          });
          stopServiceSession(userId);
          user.isServiceActive = false;
          await user.save();
        }
        return;
      }

      // Check user has discovered this recipe
      const userRecipe = await UserRecipe.findOne({
        userId,
        recipeId,
        discovered: true
      });

      if (!userRecipe) {
        socket.emit('order:serve_result', {
          success: false,
          orderId,
          message: 'Vous n\'avez pas encore decouvert cette recette ! Allez au Laboratoire.'
        });
        return;
      }

      // Success! Clear the order timeout and remove from active orders
      clearTimeout(orderEntry.timeoutId);
      session.orders.delete(orderId);

      // +1 satisfaction
      const user = await User.findById(userId);
      user.satisfaction += 1;
      await user.save();

      socket.emit('order:serve_result', {
        success: true,
        orderId,
        recipeName: orderEntry.order.recipeName,
        satisfaction: user.satisfaction,
        message: `Commande servie : ${orderEntry.order.recipeName} ! (+1 satisfaction)`
      });

      console.log(`[SERVI] Par ${userId}: ${orderEntry.order.recipeName} | Satisfaction: ${user.satisfaction}`);
    } catch (err) {
      console.error('Serve order error:', err);
      socket.emit('order:serve_result', {
        success: false,
        message: 'Erreur serveur lors du service de la commande'
      });
    }
  });

  // Client rejects/skips an order (cannot serve it)
  socket.on('order:reject', async ({ orderId }) => {
    try {
      const session = activeSessions.get(userId);
      if (!session) return;

      const orderEntry = session.orders.get(orderId);
      if (!orderEntry) return;

      // Clear timeout and remove order
      clearTimeout(orderEntry.timeoutId);
      session.orders.delete(orderId);

      // -10 satisfaction for rejected order
      const user = await User.findById(userId);
      user.satisfaction -= 10;
      await user.save();

      socket.emit('order:rejected', {
        orderId,
        recipeName: orderEntry.order.recipeName,
        satisfaction: user.satisfaction,
        message: `Commande rejetee : ${orderEntry.order.recipeName} ! (-10 satisfaction)`
      });

      // Check game over
      if (user.satisfaction < 0) {
        socket.emit('service:gameover', {
          satisfaction: user.satisfaction,
          message: 'Game Over ! La satisfaction est tombee en dessous de 0 !'
        });
        stopServiceSession(userId);
        user.isServiceActive = false;
        await user.save();
      }
    } catch (err) {
      console.error('Reject order error:', err);
    }
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log(`[SOCKET] Client deconnecte: ${socket.id} (user: ${userId})`);
    stopServiceSession(userId);
  });
});

// Server Start
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`[SERVEUR] En cours d'execution sur le port ${PORT}`);
});
