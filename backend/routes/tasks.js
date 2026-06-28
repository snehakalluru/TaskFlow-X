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

function normalizeStatus(status) {
  if (status === 'inprogress') return 'in_progress';
  if (status === 'review') return 'blocked';
  return status;
}

const allowedSortFields = new Set(['title', 'priority', 'dueDate', 'createdAt', 'updatedAt', 'kanbanOrder', 'status']);
const priorityRank = { low: 1, medium: 2, high: 3, urgent: 4 };

async function createNotificationOnce({ ownerId, taskId, type, message }) {
  const exists = await Notification.exists({ ownerId, taskId, type });
  if (exists) return null;
  return Notification.create({
    ownerId,
    taskId,
    type,
    message,
    readAt: null,
  });
}

async function generateDueNotifications(ownerId) {
  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);

  const [overdueTasks, dueTodayTasks] = await Promise.all([
    Task.find({ ownerId, status: { $ne: 'completed' }, dueDate: { $lt: start } }).select('_id title').lean(),
    Task.find({ ownerId, status: { $ne: 'completed' }, dueDate: { $gte: start, $lte: end } }).select('_id title').lean(),
  ]);

  await Promise.all([
    ...overdueTasks.map((task) =>
      createNotificationOnce({
        ownerId,
        taskId: task._id,
        type: 'overdue',
        message: `Overdue: ${task.title}`,
      })
    ),
    ...dueTodayTasks.map((task) =>
      createNotificationOnce({
        ownerId,
        taskId: task._id,
        type: 'due_today',
        message: `Due today: ${task.title}`,
      })
    ),
  ]);
}

router.get(
  '/members',
  requireAuth,
  asyncHandler(async (req, res) => {
    const users = await User.find().select('name email theme profileImageUrl').limit(50).lean();
    res.json({ success: true, data: users.map((user) => ({ ...user, id: user._id })) });
  })
);

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

    if (status) query.status = normalizeStatus(status);
    if (priority) query.priority = priority;
    if (categoryId) {
      if (!mongoose.Types.ObjectId.isValid(categoryId)) throw new ApiError(400, 'Invalid categoryId');
      query.categoryId = categoryId;
    }
    if (tag) query.tags = { $in: [tag] };

    if (q) {
      query.$or = [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
      ];
    }

    const lim = Math.max(1, Math.min(200, Number(limit) || 50));
    const off = Math.max(0, Number(offset) || 0);

    await generateDueNotifications(ownerId);

    const requestedSort = allowedSortFields.has(String(sortBy)) ? String(sortBy) : 'dueDate';
    const dir = String(sortDir).toLowerCase() === 'desc' ? -1 : 1;
    const [rawItems, total] = await Promise.all([
      Task.find(query).populate('categoryId', 'name').lean(),
      Task.countDocuments(query),
    ]);

    const items = rawItems
      .sort((a, b) => {
        let left;
        let right;
        let leftMissing = false;
        let rightMissing = false;

        if (requestedSort === 'priority') {
          left = priorityRank[a.priority] ?? 0;
          right = priorityRank[b.priority] ?? 0;
        } else if (requestedSort === 'dueDate' || requestedSort === 'createdAt' || requestedSort === 'updatedAt') {
          leftMissing = !a[requestedSort];
          rightMissing = !b[requestedSort];
          left = leftMissing ? 0 : new Date(a[requestedSort]).getTime();
          right = rightMissing ? 0 : new Date(b[requestedSort]).getTime();
        } else {
          left = a[requestedSort] ?? '';
          right = b[requestedSort] ?? '';
        }

        if (leftMissing && !rightMissing) return 1;
        if (!leftMissing && rightMissing) return -1;
        if (left < right) return -1 * dir;
        if (left > right) return 1 * dir;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      })
      .slice(off, off + lim);

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
      status: normalizeStatus(status),
      assignedMemberIds: assigned,
    });

    await createNotificationOnce({
      ownerId,
      taskId: task._id,
      type: 'new_task',
      message: `New task created: ${task.title}`,
    });

    await generateDueNotifications(ownerId);

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

    const wasCompleted = task.status === 'completed';

    task.title = title ?? task.title;
    task.description = description ?? task.description;
    task.priority = priority ?? task.priority;
    task.dueDate = dueDate !== undefined ? (dueDate ? new Date(dueDate) : null) : task.dueDate;
    task.categoryId = categoryId || null;
    task.tags = normalizeTags(tags);
    if (status) task.status = normalizeStatus(status);
    task.assignedMemberIds = memberIds.filter((id) => mongoose.Types.ObjectId.isValid(id));

    if (task.status === 'completed' && !task.completedAt) task.completedAt = new Date();
    if (task.status !== 'completed') task.completedAt = null;

    await task.save();

    if (!wasCompleted && task.status === 'completed') {
      await createNotificationOnce({
        ownerId,
        taskId: task._id,
        type: 'task_completed',
        message: `Task completed: ${task.title}`,
      });
    }

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

    const wasCompleted = task.status === 'completed';
    task.status = 'completed';
    task.completedAt = new Date();
    await task.save();

    if (!wasCompleted) {
      await createNotificationOnce({
        ownerId,
        type: 'task_completed',
        taskId: task._id,
        message: `Task completed: ${task.title}`,
      });
    }

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
    const nextStatus = normalizeStatus(status);

    const task = await Task.findOne({ _id: req.params.id, ownerId });
    if (!task) throw new ApiError(404, 'Task not found');

    const wasCompleted = task.status === 'completed';
    task.status = nextStatus;
    if (typeof kanbanOrder === 'number') task.kanbanOrder = kanbanOrder;

    if (nextStatus === 'completed') {
      if (!task.completedAt) task.completedAt = new Date();

      if (!wasCompleted) {
        await createNotificationOnce({
          ownerId,
          type: 'task_completed',
          taskId: task._id,
          message: `Task completed: ${task.title}`,
        });
      }
    } else {
      task.completedAt = null;
    }

    await task.save();
    res.json({ success: true, data: task });
  })
);

module.exports = router;

