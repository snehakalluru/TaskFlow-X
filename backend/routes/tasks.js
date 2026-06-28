const express = require('express');
const mongoose = require('mongoose');

const { requireAuth } = require('../middleware/auth');
const { asyncHandler } = require('../utils/asyncHandler');
const { ApiError } = require('../utils/ApiError');

const Task = require('../models/Task');
const Category = require('../models/Category');
const User = require('../models/User');
const Notification = require('../models/Notification');

const router = express.Router();

function normalizeTags(tags) {
  if (!tags) return [];
  if (Array.isArray(tags)) return tags.map((t) => String(t).trim()).filter(Boolean);
  return String(tags)
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);
}

router.get(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const ownerId = req.user._id;
    const {
      q,
      status,
      priority,
      categoryId,
      tag,
      sortBy = 'dueDate',
      sortDir = 'asc',
      limit = '50',
      offset = '0',
    } = req.query;

    const query = { ownerId };

    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (categoryId) query.categoryId = categoryId;
    if (tag) query.tags = { $in: [tag] };

    if (q) {
      query.$or = [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
      ];
    }

    const lim = Math.max(1, Math.min(200, Number(limit) || 50));
    const off = Math.max(0, Number(offset) || 0);

    const dir = String(sortDir).toLowerCase() === 'desc' ? -1 : 1;
    const sort = { [sortBy]: dir, createdAt: dir };

    const [items, total] = await Promise.all([
      Task.find(query)
        .sort(sort)
        .skip(off)
        .limit(lim)
        .populate('categoryId', 'name')
        .lean(),
      Task.countDocuments(query),
    ]);

    res.json({ success: true, data: { items, total, limit: lim, offset: off } });
  })
);

router.post(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const ownerId = req.user._id;
    const {
      title,
      description,
      priority,
      dueDate,
      categoryId = null,
      tags,
      status = 'todo',
      assignedMemberIds = [],
    } = req.body || {};

    if (!title) throw new ApiError(400, 'title is required');

    if (categoryId) {
      const cat = await Category.findOne({ _id: categoryId, ownerId });
      if (!cat) throw new ApiError(400, 'Invalid categoryId');
    }

    const normalizedTags = normalizeTags(tags);

    const memberIds = Array.isArray(assignedMemberIds)
      ? assignedMemberIds
      : typeof assignedMemberIds === 'string'
        ? assignedMemberIds.split(',').map((s) => s.trim()).filter(Boolean)
        : [];

    // Allow assigning to existing users by ObjectId; in MVP we don’t enforce membership.
    const assigned = memberIds.filter((id) => mongoose.Types.ObjectId.isValid(id));

    const task = await Task.create({
      ownerId,
      title,
      description: description || '',
      priority: priority || 'medium',
      dueDate: dueDate ? new Date(dueDate) : null,
      categoryId: categoryId || null,
      tags: normalizedTags,
      status,
      assignedMemberIds: assigned,
    });

    res.status(201).json({ success: true, data: task });
  })
);

router.get(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const task = await Task.findOne({ _id: req.params.id, ownerId: req.user._id }).populate('categoryId', 'name');
    if (!task) throw new ApiError(404, 'Task not found');
    res.json({ success: true, data: task });
  })
);

router.put(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const ownerId = req.user._id;
    const {
      title,
      description,
      priority,
      dueDate,
      categoryId = null,
      tags,
      status,
      assignedMemberIds = [],
    } = req.body || {};

    const task = await Task.findOne({ _id: req.params.id, ownerId });
    if (!task) throw new ApiError(404, 'Task not found');

    if (categoryId) {
      const cat = await Category.findOne({ _id: categoryId, ownerId });
      if (!cat) throw new ApiError(400, 'Invalid categoryId');
    }

    const memberIds = Array.isArray(assignedMemberIds)
      ? assignedMemberIds
      : typeof assignedMemberIds === 'string'
        ? assignedMemberIds.split(',').map((s) => s.trim()).filter(Boolean)
        : [];

    task.title = title ?? task.title;
    task.description = description ?? task.description;
    task.priority = priority ?? task.priority;
    task.dueDate = dueDate !== undefined ? (dueDate ? new Date(dueDate) : null) : task.dueDate;
    task.categoryId = categoryId || null;
    task.tags = normalizeTags(tags);
    if (status) task.status = status;
    task.assignedMemberIds = memberIds.filter((id) => mongoose.Types.ObjectId.isValid(id));

    if (task.status === 'completed' && !task.completedAt) task.completedAt = new Date();
    if (task.status !== 'completed') task.completedAt = null;

    await task.save();

    res.json({ success: true, data: task });
  })
);

router.delete(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const ownerId = req.user._id;
    const task = await Task.findOne({ _id: req.params.id, ownerId });
    if (!task) throw new ApiError(404, 'Task not found');

    await Task.deleteOne({ _id: task._id });
    await Notification.deleteMany({ ownerId, taskId: task._id });

    res.json({ success: true });
  })
);

router.patch(
  '/:id/complete',
  requireAuth,
  asyncHandler(async (req, res) => {
    const ownerId = req.user._id;
    const task = await Task.findOne({ _id: req.params.id, ownerId });
    if (!task) throw new ApiError(404, 'Task not found');

    task.status = 'completed';
    task.completedAt = new Date();
    await task.save();

    await Notification.create({
      ownerId,
      type: 'task_completed',
      taskId: task._id,
      message: `Task completed: ${task.title}`,
      readAt: null,
    });

    res.json({ success: true, data: task });
  })
);

// Kanban status update endpoint
router.patch(
  '/:id/status',
  requireAuth,
  asyncHandler(async (req, res) => {
    const ownerId = req.user._id;
    const { status, kanbanOrder } = req.body || {};

    if (!status) throw new ApiError(400, 'status is required');

    const task = await Task.findOne({ _id: req.params.id, ownerId });
    if (!task) throw new ApiError(404, 'Task not found');

    task.status = status;
    if (typeof kanbanOrder === 'number') task.kanbanOrder = kanbanOrder;

    if (status === 'completed') {
      if (!task.completedAt) task.completedAt = new Date();

      await Notification.create({
        ownerId,
        type: 'task_completed',
        taskId: task._id,
        message: `Task completed: ${task.title}`,
        readAt: null,
      });
    } else {
      task.completedAt = null;
    }

    await task.save();
    res.json({ success: true, data: task });
  })
);

router.get(
  '/members',
  requireAuth,
  asyncHandler(async (req, res) => {
    // MVP: list all users in the system (or you can scope by owner/team later)
    // In production you would add team membership.
    const users = await User.find().select('name email theme profileImageUrl').limit(50).lean();
    res.json({ success: true, data: users });
  })
);

module.exports = router;

