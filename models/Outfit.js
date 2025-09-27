const mongoose = require('mongoose');

const outfitSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  items: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ClothingItem',
    required: true
  }],
  tags: [{
    type: String,
    trim: true
  }],
  occasion: {
    type: String,
    enum: ['work', 'casual', 'formal', 'sport', 'party', 'date', 'travel', 'home'],
    required: true
  },
  season: {
    type: String,
    enum: ['summer', 'winter', 'spring', 'fall', 'all-season'],
    default: 'all-season'
  },
  style: {
    type: String,
    enum: ['casual', 'formal', 'sporty', 'vintage', 'modern', 'bohemian', 'streetwear'],
    default: 'casual'
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: null
  },
  isFavorite: {
    type: Boolean,
    default: false
  },
  wearCount: {
    type: Number,
    default: 0
  },
  lastWorn: {
    type: Date,
    default: null
  },
  imageUrl: {
    type: String,
    default: null
  },
  notes: {
    type: String,
    trim: true
  },
  isAIGenerated: {
    type: Boolean,
    default: false
  },
  aiConfidence: {
    type: Number,
    min: 0,
    max: 1,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient queries
outfitSchema.index({ userId: 1, occasion: 1 });
outfitSchema.index({ userId: 1, isFavorite: 1 });
outfitSchema.index({ userId: 1, createdAt: -1 });

// Virtual for outfit compatibility score
outfitSchema.virtual('compatibilityScore').get(function() {
  if (!this.rating) return null;
  return (this.rating / 5) * 100;
});

module.exports = mongoose.model('Outfit', outfitSchema);
