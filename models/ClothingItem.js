const mongoose = require('mongoose');

const clothingItemSchema = new mongoose.Schema({
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
  category: {
    type: String,
    required: true,
    enum: ['top', 'bottom', 'shoes', 'accessories', 'outerwear', 'underwear']
  },
  subcategory: {
    type: String,
    required: true,
    enum: [
      // Tops
      't-shirt', 'shirt', 'blouse', 'tank-top', 'sweater', 'hoodie', 'polo',
      // Bottoms
      'jeans', 'pants', 'shorts', 'skirt', 'dress', 'leggings',
      // Shoes
      'sneakers', 'boots', 'sandals', 'heels', 'flats', 'loafers',
      // Accessories
      'hat', 'scarf', 'belt', 'bag', 'watch', 'jewelry',
      // Outerwear
      'jacket', 'coat', 'blazer', 'cardigan',
      // Underwear
      'bra', 'underwear', 'socks'
    ]
  },
  color: {
    type: String,
    required: true,
    enum: ['black', 'white', 'red', 'blue', 'green', 'yellow', 'purple', 'pink', 'orange', 'brown', 'gray', 'navy', 'beige', 'maroon', 'teal']
  },
  brand: {
    type: String,
    trim: true
  },
  size: {
    type: String,
    trim: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  imagePublicId: {
    type: String,
    required: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  isInWash: {
    type: Boolean,
    default: false
  },
  lastWorn: {
    type: Date,
    default: null
  },
  wearCount: {
    type: Number,
    default: 0
  },
  dominantColors: [{
    type: String
  }],
  style: {
    type: String,
    enum: ['casual', 'formal', 'sporty', 'vintage', 'modern', 'bohemian', 'streetwear'],
    default: 'casual'
  },
  season: {
    type: String,
    enum: ['summer', 'winter', 'spring', 'fall', 'all-season'],
    default: 'all-season'
  },
  occasion: {
    type: String,
    enum: ['work', 'casual', 'formal', 'sport', 'party', 'date', 'travel', 'home'],
    default: 'casual'
  },
  price: {
    type: Number,
    default: null
  },
  purchaseDate: {
    type: Date,
    default: null
  },
  notes: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient queries
clothingItemSchema.index({ userId: 1, category: 1 });
clothingItemSchema.index({ userId: 1, isInWash: 1 });
clothingItemSchema.index({ userId: 1, style: 1 });

module.exports = mongoose.model('ClothingItem', clothingItemSchema);