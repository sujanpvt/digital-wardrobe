const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const ClothingItem = require('../models/ClothingItem');
const auth = require('../middleware/auth');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Upload clothing item
router.post('/upload', auth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    const {
      name,
      category,
      subcategory,
      color,
      brand,
      size,
      tags,
      style,
      season,
      occasion,
      price,
      notes
    } = req.body;

    // Determine storage strategy (Cloudinary or local fallback)
    const cloudConfigured =
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET &&
      !String(process.env.CLOUDINARY_CLOUD_NAME).startsWith('your-');

    let imageUrl;
    let imagePublicId = null;

    if (cloudConfigured) {
      try {
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: 'wardrobe',
          transformation: [
            { width: 800, height: 800, crop: 'fill', quality: 'auto' }
          ]
        });
        imageUrl = result.secure_url;
        imagePublicId = result.public_id;
        // Clean up local file after successful cloud upload
        try { fs.unlinkSync(req.file.path); } catch (_) {}
      } catch (cloudErr) {
        console.error('Cloudinary upload failed, using local file:', cloudErr);
        imageUrl = `${req.protocol}://${req.get('host')}/uploads/${path.basename(req.file.path)}`;
      }
    } else {
      // Local storage fallback
      imageUrl = `${req.protocol}://${req.get('host')}/uploads/${path.basename(req.file.path)}`;
    }

    // Create clothing item
    const clothingItem = new ClothingItem({
      userId: req.user._id,
      name,
      category,
      subcategory,
      color,
      brand,
      size,
      imageUrl,
      imagePublicId,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      style,
      season,
      occasion,
      price: price ? parseFloat(price) : null,
      notes
    });

    await clothingItem.save();

    // If using local fallback, keep the file on disk (already served statically)

    res.status(201).json({
      message: 'Clothing item uploaded successfully',
      item: clothingItem
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Server error during upload' });
  }
});

// Get all clothing items for user
router.get('/user/:userId', auth, async (req, res) => {
  try {
    const { category, isInWash, style, color } = req.query;
    const { userId } = req.params;

    // Verify user can access these items
    if (req.user._id.toString() !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    let query = { userId };

    // Apply filters
    if (category) query.category = category;
    if (isInWash !== undefined) query.isInWash = isInWash === 'true';
    if (style) query.style = style;
    if (color) query.color = color;

    const items = await ClothingItem.find(query)
      .sort({ createdAt: -1 })
      .populate('userId', 'username');

    res.json({ items });
  } catch (error) {
    console.error('Get items error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single clothing item
router.get('/:id', auth, async (req, res) => {
  try {
    const item = await ClothingItem.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!item) {
      return res.status(404).json({ message: 'Clothing item not found' });
    }

    res.json({ item });
  } catch (error) {
    console.error('Get item error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update clothing item
router.put('/:id', auth, async (req, res) => {
  try {
    const {
      name,
      category,
      subcategory,
      color,
      brand,
      size,
      tags,
      style,
      season,
      occasion,
      price,
      notes
    } = req.body;

    const item = await ClothingItem.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      {
        name,
        category,
        subcategory,
        color,
        brand,
        size,
        tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
        style,
        season,
        occasion,
        price: price ? parseFloat(price) : null,
        notes
      },
      { new: true }
    );

    if (!item) {
      return res.status(404).json({ message: 'Clothing item not found' });
    }

    res.json({
      message: 'Clothing item updated successfully',
      item
    });
  } catch (error) {
    console.error('Update item error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update wash status
router.put('/:id/wash-status', auth, async (req, res) => {
  try {
    const { isInWash } = req.body;

    const item = await ClothingItem.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { isInWash },
      { new: true }
    );

    if (!item) {
      return res.status(404).json({ message: 'Clothing item not found' });
    }

    res.json({
      message: 'Wash status updated successfully',
      item
    });
  } catch (error) {
    console.error('Update wash status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete clothing item
router.delete('/:id', auth, async (req, res) => {
  try {
    const item = await ClothingItem.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!item) {
      return res.status(404).json({ message: 'Clothing item not found' });
    }

    // Delete image from Cloudinary
    await cloudinary.uploader.destroy(item.imagePublicId);

    // Delete item from database
    await ClothingItem.findByIdAndDelete(req.params.id);

    res.json({ message: 'Clothing item deleted successfully' });
  } catch (error) {
    console.error('Delete item error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get items by category
router.get('/category/:category', auth, async (req, res) => {
  try {
    const { category } = req.params;
    const { isInWash } = req.query;

    let query = {
      userId: req.user._id,
      category
    };

    if (isInWash !== undefined) {
      query.isInWash = isInWash === 'true';
    }

    const items = await ClothingItem.find(query).sort({ createdAt: -1 });

    res.json({ items });
  } catch (error) {
    console.error('Get items by category error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
