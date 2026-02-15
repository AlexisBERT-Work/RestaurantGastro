require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');

const connectDB = require('./config/db');
const initSocket = require('./socket');
const { startExpirationCron } = require('./cron/expirationCron');

// Initialisation Express + serveur HTTP
const app = express();
const server = http.createServer(app);

// Configuration Socket.io
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Connexion a la base de donnees
connectDB();

// Routes API
app.use('/api/auth', require('./routes/auth'));
app.use('/api/lab', require('./routes/lab'));
app.use('/api/recipes', require('./routes/recipes'));
app.use('/api/service', require('./routes/service'));
app.use('/api/transactions', require('./routes/transactions'));
app.use('/api/ingredients', require('./routes/ingredients'));

// Point de controle
app.get('/api/health', (req, res) => {
  res.json({ status: 'Serveur en cours d\'execution' });
});

// Initialisation Socket.io (service en temps reel)
initSocket(io);

// Demarrage du cron de nettoyage des ingredients perimes
startExpirationCron();

// Demarrage du serveur
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`[SERVEUR] En cours d'execution sur le port ${PORT}`);
});