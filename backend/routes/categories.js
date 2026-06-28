const express = require('express');

const { requireAuth } = require('../middleware/auth');
const { asyncHandler } = require('../utils/asyncHandler');
const { ApiError } = require('../utils/ApiError');
const Category = require('../models/Category');

const router = express.Router();

router.get(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const cats = await Category.find({ ownerId: req.user._id }).sort({ name: 1 }).lean();
    res.json({ success: true, data: cats });
  })
);

router.post(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { name } = req.body || {};
    if (!name) throw new ApiError(400, 'name is required');
    const cat = await Category.create({ ownerId: req.user._id, name: String(name).trim() });
    res.status(201).json({ success: true, data: cat });
  })
);

router.delete(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const cat = await Category.findOneAndDelete({ _id: id, ownerId: req.user._id });
    if (!cat) throw new ApiError(404, 'Category not found');
    res.json({ success: true });
  })
);

router.patch(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { name } = req.body || {};
    if (!name) throw new ApiError(400, 'name is required');

    const cat = await Category.findOneAndUpdate(
      { _id: req.params.id, ownerId: req.user._id },
      { $set: { name: String(name).trim() } },
      { new: true }
    );

    if (!cat) throw new ApiError(404, 'Category not found');
    res.json({ success: true, data: cat });
  })
);

module.exports = router;

