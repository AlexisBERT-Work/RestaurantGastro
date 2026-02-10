require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');


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
  console.log('✅ MongoDB Connected');
}).catch((err) => {
  console.error('❌ MongoDB Connection Error:', err);
  process.exit(1);
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/lab', require('./routes/lab'));
app.use('/api/recipes', require('./routes/recipes'));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: '✅ Server is running' });
});

// Real-time Socket.io Events (To be implemented)
io.on('connection', (socket) => {
  console.log('📱 New client connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('📱 Client disconnected:', socket.id);
  });
});

// Server Start
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
