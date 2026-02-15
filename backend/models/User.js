const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');

const userSchema = new mongoose.Schema({
  restaurantName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    match: /.+\@.+\..+/
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  satisfaction: {
    type: Number,
    default: 20
  },
  isServiceActive: {
    type: Boolean,
    default: false
  },
  treasury: {
    type: Number,
    default: 500
  },
  stars: {
    type: Number,
    default: 3,
    min: 0,
    max: 3
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash le mot de passe avant sauvegarde
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcryptjs.genSalt(10);
    this.password = await bcryptjs.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Compare les mots de passe
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcryptjs.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
