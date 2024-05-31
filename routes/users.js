const express = require('express');
const User = require('../models/User');
const { authenticateToken, isAdmin } = require('../middlewares/auth');
const router = express.Router();

// Get user profile
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// Edit user profile
router.put('/me', authenticateToken, async (req, res) => {
  const { name, bio, phone, email, photo, isPublic } = req.body;
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    user.name = name || user.name;
    user.bio = bio || user.bio;
    user.phone = phone || user.phone;
    user.email = email || user.email;
    user.photo = photo || user.photo;
    user.isPublic = isPublic !== undefined ? isPublic : user.isPublic;

    await user.save();
    res.json(user);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// List public profiles
router.get('/public', async (req, res) => {
  try {
    const users = await User.find({ isPublic: true }).select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// Get profile by ID (admin access only)
router.get('/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ msg: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

module.exports = router;
