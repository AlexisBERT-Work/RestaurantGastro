const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Register
exports.register = async (req, res) => {
  try {
    const { restaurantName, email, password, passwordConfirm } = req.body;

    if (!restaurantName || !email || !password || !passwordConfirm) {
      return res.status(400).json({ message: '❌ All fields are required' });
    }

    if (password !== passwordConfirm) {
      return res.status(400).json({ message: '❌ Passwords do not match' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: '❌ Email already in use' });
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
      message: '✅ User registered successfully',
      token,
      user: {
        id: user._id,
        restaurantName: user.restaurantName,
        email: user.email
      }
    });
  } catch (err) {
    console.error('Register Error:', err);
    res.status(500).json({ message: '❌ Server error', error: err.message });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: '❌ Email and password required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: '❌ Invalid credentials' });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: '❌ Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });

    res.json({
      message: '✅ Login successful',
      token,
      user: {
        id: user._id,
        restaurantName: user.restaurantName,
        email: user.email
      }
    });
  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ message: '❌ Server error', error: err.message });
  }
};
