const express = require('express');
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const { requireAuth } = require('../middleware/auth');
const { asyncHandler } = require('../utils/asyncHandler');
const { ApiError } = require('../utils/ApiError');
const User = require('../models/User');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadsPath = path.join(__dirname, '..', 'uploads');
    fs.mkdirSync(uploadsPath, { recursive: true });
    cb(null, uploadsPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || '.png');
    const name = `${req.user._id}-${Date.now()}${ext}`;
    cb(null, name);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) return cb(new ApiError(400, 'Only image uploads are allowed'));
    cb(null, true);
  },
});

router.get('/me', requireAuth, asyncHandler(async (req, res) => {
  const u = req.user;
  res.json({
    success: true,
    user: {
      id: u._id,
      name: u.name,
      email: u.email,
      theme: u.theme,
      profileImageUrl: u.profileImageUrl,
    },
  });
}));

router.patch(
  '/profile',
  requireAuth,
  upload.single('profileImage'),
  asyncHandler(async (req, res) => {
    const { name, theme } = req.body || {};

    const update = {};
    if (name) update.name = String(name).trim();
    if (theme && ['light', 'dark'].includes(theme)) update.theme = theme;

    if (req.file) {
      const url = `${(process.env.CLIENT_URL || 'http://localhost:3000').replace(/\/$/, '')}/uploads/${req.file.filename}`;
      update.profileImageUrl = url;
    }

    const user = await User.findByIdAndUpdate(req.user._id, update, { new: true }).select('name email theme profileImageUrl');

    if (!user) throw new ApiError(404, 'User not found');

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        theme: user.theme,
        profileImageUrl: user.profileImageUrl,
      },
    });
  })
);

router.patch(
  '/password',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body || {};

    if (!currentPassword || !newPassword) {
      throw new ApiError(400, 'currentPassword and newPassword are required');
    }

    if (newPassword.length < 8) {
      throw new ApiError(400, 'New password must be at least 8 characters');
    }

    const user = await User.findById(req.user._id);
    if (!user) throw new ApiError(404, 'User not found');

    const ok = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!ok) throw new ApiError(401, 'Current password is incorrect');

    const passwordHash = await bcrypt.hash(newPassword, 10);
    user.passwordHash = passwordHash;
    await user.save();

    res.json({ success: true });
  })
);

module.exports = router;

