const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  avatar: {
    type: String,
    default: null
  },
  preferences: {
    style: {
      type: String,
      enum: ['casual', 'formal', 'sporty', 'vintage', 'modern', 'bohemian'],
      default: 'casual'
    },
    colors: [{
      type: String,
      enum: ['black', 'white', 'red', 'blue', 'green', 'yellow', 'purple', 'pink', 'orange', 'brown', 'gray']
    }],
    occasions: [{
      type: String,
      enum: ['work', 'casual', 'formal', 'sport', 'party', 'date', 'travel']
    }]
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
