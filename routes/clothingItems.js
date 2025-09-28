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
    fileSize: 50 * 1024 * 1024 // 50MB limit to allow short videos
  },
  fileFilter: (req, file, cb) => {
    const isImage = file.mimetype.startsWith('image/');
    const isVideo = file.mimetype.startsWith('video/');
    if (isImage || isVideo) {
      cb(null, true);
    } else {
      cb(new Error('Only image or video files are allowed'), false);
    }
  }
});

// Upload clothing item
router.post('/upload', auth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No media file provided' });
    }

    const {
      name,
      category,
      subcategory,
      color,
      colorHex,
      brand,
      size,
      tags,
      style,
      season,
      occasion,
      price,
      notes
    } = req.body;

    // Enforce Cloudinary-only uploads
    const cloudConfigured =
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET &&
      !String(process.env.CLOUDINARY_CLOUD_NAME).startsWith('your-');

    if (!cloudConfigured) {
      // Clean up temp file and reject upload when Cloudinary is not configured
      try { fs.unlinkSync(req.file.path); } catch (_) {}
      return res.status(500).json({
        message: 'Cloudinary is not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET.'
      });
    }

    let imageUrl;
    let imagePublicId;
    let mediaType = 'image';

    try {
      const isImage = req.file.mimetype.startsWith('image/');
      const uploadOptions = {
        folder: 'wardrobe',
        resource_type: 'auto'
      };
      if (isImage) {
        uploadOptions.transformation = [
          { width: 800, height: 800, crop: 'fill', quality: 'auto' }
        ];
      }

      const result = await cloudinary.uploader.upload(req.file.path, uploadOptions);
      imageUrl = result.secure_url;
      imagePublicId = result.public_id;
      if (result.resource_type === 'video') {
        mediaType = 'video';
      }
      // Clean up local file after successful cloud upload
      try { fs.unlinkSync(req.file.path); } catch (_) {}
    } catch (cloudErr) {
      console.error('Cloudinary upload failed:', cloudErr);
      // Clean up temp file on failure too
      try { fs.unlinkSync(req.file.path); } catch (_) {}
      return res.status(500).json({ message: 'Cloudinary upload failed' });
    }

    // Create clothing item
    const clothingItem = new ClothingItem({
      userId: req.user._id,
      name,
      category,
      subcategory,
      color,
      colorHex,
      brand,
      size,
      imageUrl,
      imagePublicId,
      mediaType,
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
      colorHex,
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
        colorHex,
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

    // Delete image from Cloudinary if configured and public id exists
    const cloudConfigured =
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET &&
      !String(process.env.CLOUDINARY_CLOUD_NAME).startsWith('your-');

    if (cloudConfigured && item.imagePublicId) {
      try {
        await cloudinary.uploader.destroy(item.imagePublicId);
      } catch (cloudErr) {
        console.error('Cloudinary destroy failed:', cloudErr);
      }
    }

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
