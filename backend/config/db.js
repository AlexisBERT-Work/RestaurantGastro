const mongoose = require('mongoose');

// Connexion a la base de donnees MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('[OK] MongoDB connecte');
  } catch (err) {
    console.error('[ERREUR] Erreur de connexion MongoDB:', err);
    process.exit(1);
  }
};

module.exports = connectDB;
