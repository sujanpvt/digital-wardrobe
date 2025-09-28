const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');
const https = require('https');

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email or username' });
    }

    // Create new user
    const user = new User({
      username,
      email,
      password
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        preferences: user.preferences
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Login (supports email OR username as identifier)
router.post('/login', async (req, res) => {
  try {
    const { email, username, password } = req.body;

    // Accept either email or username as the identifier
    const identifier = (email || username || '').trim();

    // Validation
    if (!identifier || !password) {
      return res.status(400).json({ message: 'Please provide email/username and password' });
    }

    // Find user by email OR username
    const user = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }]
    });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        preferences: user.preferences
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    res.json({
      user: {
        id: req.user._id,
        username: req.user.username,
        email: req.user.email,
        preferences: req.user.preferences,
        avatar: req.user.avatar
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user preferences
router.put('/preferences', auth, async (req, res) => {
  try {
    const { style, colors, occasions } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        $set: {
          'preferences.style': style,
          'preferences.colors': colors,
          'preferences.occasions': occasions
        }
      },
      { new: true }
    );

    res.json({
      message: 'Preferences updated successfully',
      preferences: user.preferences
    });
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

// --- Google OAuth (ID token) ---
// Verify Google ID token via tokeninfo endpoint (no external deps)
async function verifyGoogleIdToken(idToken, expectedAud) {
  return new Promise((resolve, reject) => {
    const url = `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`;
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => (data += chunk));
      res.on('end', () => {
        try {
          const payload = JSON.parse(data);
          if (payload.error_description) {
            return reject(new Error(payload.error_description));
          }
          if (expectedAud && payload.aud !== expectedAud) {
            return reject(new Error('Invalid audience'));
          }
          resolve(payload);
        } catch (err) {
          reject(err);
        }
      });
    }).on('error', reject);
  });
}

router.post('/google', async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({ message: 'Missing Google idToken' });
    }

    if (!process.env.GOOGLE_CLIENT_ID) {
      return res.status(500).json({ message: 'GOOGLE_CLIENT_ID not configured' });
    }

    const payload = await verifyGoogleIdToken(idToken, process.env.GOOGLE_CLIENT_ID);
    const email = payload.email;
    const username = (payload.name || email.split('@')[0]).replace(/[^a-zA-Z0-9_\.\-]/g, '').slice(0, 24);

    let user = await User.findOne({ email });
    if (!user) {
      user = new User({
        username,
        email,
        password: Math.random().toString(36).slice(2) // placeholder; not used for OAuth login
      });
      await user.save();
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Google login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        preferences: user.preferences
      }
    });
  } catch (error) {
    console.error('Google OAuth error:', error);
    res.status(401).json({ message: 'Google login failed' });
  }
});

// --- Apple OAuth (stub) ---
router.post('/apple', async (req, res) => {
  // Proper Apple Sign In requires service configuration.
  // Return informative error until configured.
  return res.status(501).json({
    message: 'Apple Sign-In requires configuration. Please set up Apple credentials on server.'
  });
});
