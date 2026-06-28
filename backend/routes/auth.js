const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { ApiError } = require('../utils/ApiError');
const { asyncHandler } = require('../utils/asyncHandler');
const { signJwt } = require('../middleware/auth');

const router = express.Router();

router.post(
  '/register',
  asyncHandler(async (req, res) => {
    const { name, email, password } = req.body || {};

    if (!name || !email || !password) {
      throw new ApiError(400, 'name, email, and password are required');
    }

    if (password.length < 8) {
      throw new ApiError(400, 'Password must be at least 8 characters');
    }

    const existing = await User.findOne({ email: String(email).toLowerCase() });
    if (existing) {
      throw new ApiError(409, 'An account with this email already exists');
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email: String(email).toLowerCase(),
      passwordHash,
    });

    const token = signJwt(user);

    res.status(201).json({
      success: true,
      user: { id: user._id, name: user.name, email: user.email, theme: user.theme, profileImageUrl: user.profileImageUrl },
      token,
    });
  })
);

router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const { email, password, rememberMe } = req.body || {};

    if (!email || !password) {
      throw new ApiError(400, 'email and password are required');
    }

    const user = await User.findOne({ email: String(email).toLowerCase() });
    if (!user) {
      throw new ApiError(401, 'Invalid credentials');
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      throw new ApiError(401, 'Invalid credentials');
    }

    const payload = {
      sub: user._id.toString(),
      email: user.email,
    };

    const expiresIn = rememberMe ? '30d' : (process.env.JWT_EXPIRES_IN || '7d');
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });

    res.json({
      success: true,
      user: { id: user._id, name: user.name, email: user.email, theme: user.theme, profileImageUrl: user.profileImageUrl },
      token,
      expiresIn,
    });
  })
);

// Client “logout” just discards token (no blacklist)
router.post('/logout', asyncHandler(async (req, res) => {
  res.json({ success: true });
}));

module.exports = router;

