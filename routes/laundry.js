const express = require('express');
const Laundry = require('../models/Laundry');
const ClothingItem = require('../models/ClothingItem');
const auth = require('../middleware/auth');

const router = express.Router();

// Add items to laundry
router.post('/add-items', auth, async (req, res) => {
  try {
    const { items, expectedReturnDate, washType, notes } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'No items provided' });
    }

    // Validate items belong to user and are not already in wash
    const userItems = await ClothingItem.find({
      _id: { $in: items },
      userId: req.user._id,
      isInWash: false
    });

    if (userItems.length !== items.length) {
      return res.status(400).json({
        message: 'Some items not found, don\'t belong to user, or are already in wash'
      });
    }

    // Create laundry entry
    const laundry = new Laundry({
      userId: req.user._id,
      items,
      expectedReturnDate: new Date(expectedReturnDate),
      washType: washType || 'normal',
      notes
    });

    await laundry.save();

    // Update items to mark as in wash
    await ClothingItem.updateMany(
      { _id: { $in: items } },
      { isInWash: true }
    );

    // Populate items for response
    await laundry.populate('items');

    res.status(201).json({
      message: 'Items added to laundry successfully',
      laundry
    });
  } catch (error) {
    console.error('Add to laundry error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all laundry entries for user
router.get('/user/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.query;

    // Verify user can access these laundry entries
    if (req.user._id.toString() !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    let query = { userId };

    if (status) {
      query.status = status;
    }

    const laundryEntries = await Laundry.find(query)
      .populate('items')
      .sort({ washDate: -1 });

    res.json({ laundryEntries });
  } catch (error) {
    console.error('Get laundry error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update laundry status
router.put('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;

    if (!['washing', 'drying', 'ready', 'delayed'].includes(status)) {
      return res.status(400).json({
        message: 'Invalid status. Must be: washing, drying, ready, or delayed'
      });
    }

    const laundry = await Laundry.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { status },
      { new: true }
    ).populate('items');

    if (!laundry) {
      return res.status(404).json({ message: 'Laundry entry not found' });
    }

    // If status is 'ready', mark items as not in wash
    if (status === 'ready') {
      await ClothingItem.updateMany(
        { _id: { $in: laundry.items } },
        { isInWash: false }
      );
    }

    res.json({
      message: 'Laundry status updated successfully',
      laundry
    });
  } catch (error) {
    console.error('Update laundry status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove items from laundry
router.delete('/:id/items', auth, async (req, res) => {
  try {
    const { itemIds } = req.body;

    const laundry = await Laundry.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!laundry) {
      return res.status(404).json({ message: 'Laundry entry not found' });
    }

    // Remove items from laundry
    laundry.items = laundry.items.filter(
      itemId => !itemIds.includes(itemId.toString())
    );

    // If no items left, delete the laundry entry
    if (laundry.items.length === 0) {
      await Laundry.findByIdAndDelete(laundry._id);
      return res.json({ message: 'Laundry entry deleted (no items remaining)' });
    }

    await laundry.save();

    // Mark items as not in wash
    await ClothingItem.updateMany(
      { _id: { $in: itemIds } },
      { isInWash: false }
    );

    res.json({
      message: 'Items removed from laundry successfully',
      laundry
    });
  } catch (error) {
    console.error('Remove items from laundry error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete laundry entry
router.delete('/:id', auth, async (req, res) => {
  try {
    const laundry = await Laundry.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!laundry) {
      return res.status(404).json({ message: 'Laundry entry not found' });
    }

    // Mark all items as not in wash
    await ClothingItem.updateMany(
      { _id: { $in: laundry.items } },
      { isInWash: false }
    );

    res.json({ message: 'Laundry entry deleted successfully' });
  } catch (error) {
    console.error('Delete laundry error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get laundry statistics
router.get('/stats/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;

    // Verify user can access these stats
    if (req.user._id.toString() !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const stats = await Laundry.aggregate([
      { $match: { userId: req.user._id } },
      {
        $group: {
          _id: null,
          totalEntries: { $sum: 1 },
          totalItems: { $sum: { $size: '$items' } },
          overdueEntries: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $ne: ['$status', 'ready'] },
                    { $lt: ['$expectedReturnDate', new Date()] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      }
    ]);

    const statusStats = await Laundry.aggregate([
      { $match: { userId: req.user._id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const washTypeStats = await Laundry.aggregate([
      { $match: { userId: req.user._id } },
      {
        $group: {
          _id: '$washType',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      stats: stats[0] || {
        totalEntries: 0,
        totalItems: 0,
        overdueEntries: 0
      },
      statusStats,
      washTypeStats
    });
  } catch (error) {
    console.error('Get laundry stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get overdue laundry
router.get('/overdue/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;

    // Verify user can access these entries
    if (req.user._id.toString() !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const overdueLaundry = await Laundry.find({
      userId: req.user._id,
      status: { $ne: 'ready' },
      expectedReturnDate: { $lt: new Date() }
    }).populate('items');

    res.json({ overdueLaundry });
  } catch (error) {
    console.error('Get overdue laundry error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

