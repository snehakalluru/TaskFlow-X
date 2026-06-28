const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { asyncHandler } = require('../utils/asyncHandler');
const { ApiError } = require('../utils/ApiError');
const Notification = require('../models/Notification');
const Task = require('../models/Task');

const router = express.Router();

function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function endOfDay(d) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

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
  const sod = startOfDay(now);
  const eod = endOfDay(now);

  const [overdueTasks, dueTodayTasks] = await Promise.all([
    Task.find({
      ownerId,
      status: { $ne: 'completed' },
      dueDate: { $lt: sod },
    }).select('_id title dueDate'),
    Task.find({
      ownerId,
      status: { $ne: 'completed' },
      dueDate: { $gte: sod, $lte: eod },
    }).select('_id title dueDate'),
  ]);

  const created = [];

  for (const task of overdueTasks) {
    const notification = await createNotificationOnce({
      ownerId,
      type: 'overdue',
      taskId: task._id,
      message: `Overdue: ${task.title}`,
    });
    if (notification) created.push(notification._id);
  }

  for (const task of dueTodayTasks) {
    const notification = await createNotificationOnce({
      ownerId,
      type: 'due_today',
      taskId: task._id,
      message: `Due today: ${task.title}`,
    });
    if (notification) created.push(notification._id);
  }

  return created.length;
}

router.get(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    await generateDueNotifications(req.user._id);

    const notifs = await Notification.find({ ownerId: req.user._id })
      .sort({ readAt: 1, scheduledAt: -1, createdAt: -1 })
      .limit(50)
      .lean();

    res.json({ success: true, data: notifs });
  })
);

router.patch(
  '/:id/read',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const notif = await Notification.findOneAndUpdate(
      { _id: id, ownerId: req.user._id },
      { $set: { readAt: new Date() } },
      { new: true }
    );

    if (!notif) throw new ApiError(404, 'Notification not found');
    res.json({ success: true, data: notif });
  })
);

router.delete(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const notif = await Notification.findOneAndDelete({ _id: req.params.id, ownerId: req.user._id });
    if (!notif) throw new ApiError(404, 'Notification not found');
    res.json({ success: true });
  })
);

// Generate due today / overdue notifications on demand (MVP)
router.post(
  '/generate',
  requireAuth,
  asyncHandler(async (req, res) => {
    const ownerId = req.user._id;
    const createdCount = await generateDueNotifications(ownerId);

    res.json({ success: true, createdCount });
  })
);

module.exports = router;

