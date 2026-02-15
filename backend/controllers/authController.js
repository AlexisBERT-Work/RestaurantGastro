const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Inscription
exports.register = async (req, res) => {
  try {
    const { restaurantName, email, password, passwordConfirm } = req.body;

    if (!restaurantName || !email || !password || !passwordConfirm) {
      return res.status(400).json({ message: 'Tous les champs sont requis' });
    }

    if (password !== passwordConfirm) {
      return res.status(400).json({ message: 'Les mots de passe ne correspondent pas' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Cet email est deja utilise' });
    }

    const user = new User({
      restaurantName,
      email,
      password
    });

    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });

    res.status(201).json({
      message: 'Inscription reussie',
      token,
      user: {
        id: user._id,
        restaurantName: user.restaurantName,
        email: user.email,
        treasury: user.treasury ?? 500
      }
    });
  } catch (err) {
    console.error('Erreur inscription:', err);
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

// Connexion
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email et mot de passe requis' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Identifiants invalides' });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Identifiants invalides' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });

    res.json({
      message: 'Connexion reussie',
      token,
      user: {
        id: user._id,
        restaurantName: user.restaurantName,
        email: user.email,
        treasury: user.treasury ?? 500
      }
    });
  } catch (err) {
    console.error('Erreur connexion:', err);
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};
