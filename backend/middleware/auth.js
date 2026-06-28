const jwt = require('jsonwebtoken');
const { ApiError } = require('../utils/ApiError');
const { asyncHandler } = require('../utils/asyncHandler');
const User = require('../models/User');

function signJwt(user) {
  const payload = {
    sub: user._id.toString(),
    email: user.email,
  };

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

const requireAuth = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    throw new ApiError(401, 'Missing or invalid Authorization header');
  }

  const token = header.slice('Bearer '.length);
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw new ApiError(401, 'Invalid or expired token');
  }

  const user = await User.findById(decoded.sub).select('_id email name theme profileImageUrl');
  if (!user) {
    throw new ApiError(401, 'User no longer exists');
  }

  req.user = user;
  return next();
});

module.exports = { requireAuth, signJwt };

