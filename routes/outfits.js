const express = require('express');
const Outfit = require('../models/Outfit');
const ClothingItem = require('../models/ClothingItem');
const auth = require('../middleware/auth');

const router = express.Router();

// Create new outfit
router.post('/create', auth, async (req, res) => {
  try {
    const {
      name,
      items,
      tags,
      occasion,
      season,
      style,
      notes
    } = req.body;

    // Validate items belong to user
    const userItems = await ClothingItem.find({
      _id: { $in: items },
      userId: req.user._id
    });

    if (userItems.length !== items.length) {
      return res.status(400).json({
        message: 'Some items not found or don\'t belong to user'
      });
    }

    // Check if any items are in wash
    const itemsInWash = userItems.filter(item => item.isInWash);
    if (itemsInWash.length > 0) {
      return res.status(400).json({
        message: 'Cannot create outfit with items currently in wash',
        itemsInWash: itemsInWash.map(item => item.name)
      });
    }

    const outfit = new Outfit({
      userId: req.user._id,
      name,
      items,
      tags: tags || [],
      occasion,
      season,
      style,
      notes
    });

    await outfit.save();

    // Populate items for response
    await outfit.populate('items');

    res.status(201).json({
      message: 'Outfit created successfully',
      outfit
    });
  } catch (error) {
    console.error('Create outfit error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all outfits for user
router.get('/user/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const { occasion, isFavorite, isAIGenerated } = req.query;

    // Verify user can access these outfits
    if (req.user._id.toString() !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    let query = { userId };

    // Apply filters
    if (occasion) query.occasion = occasion;
    if (isFavorite !== undefined) query.isFavorite = isFavorite === 'true';
    if (isAIGenerated !== undefined) query.isAIGenerated = isAIGenerated === 'true';

    const outfits = await Outfit.find(query)
      .populate('items')
      .sort({ createdAt: -1 });

    res.json({ outfits });
  } catch (error) {
    console.error('Get outfits error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single outfit
router.get('/:id', auth, async (req, res) => {
  try {
    const outfit = await Outfit.findOne({
      _id: req.params.id,
      userId: req.user._id
    }).populate('items');

    if (!outfit) {
      return res.status(404).json({ message: 'Outfit not found' });
    }

    res.json({ outfit });
  } catch (error) {
    console.error('Get outfit error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update outfit
router.put('/:id', auth, async (req, res) => {
  try {
    const {
      name,
      items,
      tags,
      occasion,
      season,
      style,
      notes,
      rating,
      isFavorite
    } = req.body;

    // If updating items, validate they belong to user
    if (items) {
      const userItems = await ClothingItem.find({
        _id: { $in: items },
        userId: req.user._id
      });

      if (userItems.length !== items.length) {
        return res.status(400).json({
          message: 'Some items not found or don\'t belong to user'
        });
      }
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (items) updateData.items = items;
    if (tags) updateData.tags = tags;
    if (occasion) updateData.occasion = occasion;
    if (season) updateData.season = season;
    if (style) updateData.style = style;
    if (notes) updateData.notes = notes;
    if (rating !== undefined) updateData.rating = rating;
    if (isFavorite !== undefined) updateData.isFavorite = isFavorite;

    const outfit = await Outfit.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      updateData,
      { new: true }
    ).populate('items');

    if (!outfit) {
      return res.status(404).json({ message: 'Outfit not found' });
    }

    res.json({
      message: 'Outfit updated successfully',
      outfit
    });
  } catch (error) {
    console.error('Update outfit error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete outfit
router.delete('/:id', auth, async (req, res) => {
  try {
    const outfit = await Outfit.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!outfit) {
      return res.status(404).json({ message: 'Outfit not found' });
    }

    res.json({ message: 'Outfit deleted successfully' });
  } catch (error) {
    console.error('Delete outfit error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark outfit as worn
router.post('/:id/wear', auth, async (req, res) => {
  try {
    const outfit = await Outfit.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      {
        $inc: { wearCount: 1 },
        lastWorn: new Date()
      },
      { new: true }
    ).populate('items');

    if (!outfit) {
      return res.status(404).json({ message: 'Outfit not found' });
    }

    // Update individual items' wear count and last worn date
    await ClothingItem.updateMany(
      { _id: { $in: outfit.items } },
      {
        $inc: { wearCount: 1 },
        lastWorn: new Date()
      }
    );

    res.json({
      message: 'Outfit marked as worn',
      outfit
    });
  } catch (error) {
    console.error('Mark outfit as worn error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get outfit statistics
router.get('/stats/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;

    // Verify user can access these stats
    if (req.user._id.toString() !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const stats = await Outfit.aggregate([
      { $match: { userId: req.user._id } },
      {
        $group: {
          _id: null,
          totalOutfits: { $sum: 1 },
          totalWears: { $sum: '$wearCount' },
          averageRating: { $avg: '$rating' },
          favoriteOutfits: {
            $sum: { $cond: ['$isFavorite', 1, 0] }
          },
          aiGeneratedOutfits: {
            $sum: { $cond: ['$isAIGenerated', 1, 0] }
          }
        }
      }
    ]);

    const occasionStats = await Outfit.aggregate([
      { $match: { userId: req.user._id } },
      {
        $group: {
          _id: '$occasion',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const styleStats = await Outfit.aggregate([
      { $match: { userId: req.user._id } },
      {
        $group: {
          _id: '$style',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json({
      stats: stats[0] || {
        totalOutfits: 0,
        totalWears: 0,
        averageRating: 0,
        favoriteOutfits: 0,
        aiGeneratedOutfits: 0
      },
      occasionStats,
      styleStats
    });
  } catch (error) {
    console.error('Get outfit stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get random outfit suggestion
router.get('/random/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const { occasion, season } = req.query;

    // Verify user can access these outfits
    if (req.user._id.toString() !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    let query = { userId };

    if (occasion) query.occasion = occasion;
    if (season) query.season = season;

    const count = await Outfit.countDocuments(query);
    
    if (count === 0) {
      return res.status(404).json({ message: 'No outfits found' });
    }

    const randomIndex = Math.floor(Math.random() * count);
    const outfit = await Outfit.findOne(query)
      .populate('items')
      .skip(randomIndex);

    res.json({ outfit });
  } catch (error) {
    console.error('Get random outfit error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
