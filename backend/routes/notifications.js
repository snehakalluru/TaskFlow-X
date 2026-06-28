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

router.get(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const notifs = await Notification.find({ ownerId: req.user._id })
      .sort({ scheduledAt: -1 })
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

// Generate due today / overdue notifications on demand (MVP)
router.post(
  '/generate',
  requireAuth,
  asyncHandler(async (req, res) => {
    const now = new Date();
    const ownerId = req.user._id;

    const sod = startOfDay(now);
    const eod = endOfDay(now);

    const overdueTasks = await Task.find({
      ownerId,
      status: { $ne: 'completed' },
      dueDate: { $lt: sod },
    }).select('_id title dueDate');

    const dueTodayTasks = await Task.find({
      ownerId,
      status: { $ne: 'completed' },
      dueDate: { $gte: sod, $lte: eod },
    }).select('_id title dueDate');

    const created = [];

    for (const t of overdueTasks) {
      const exists = await Notification.exists({
        ownerId,
        type: 'overdue',
        taskId: t._id,
      });
      if (exists) continue;

      const n = await Notification.create({
        ownerId,
        type: 'overdue',
        taskId: t._id,
        message: `Overdue: ${t.title}`,
      });
      created.push(n._id);
    }

    for (const t of dueTodayTasks) {
      const exists = await Notification.exists({
        ownerId,
        type: 'due_today',
        taskId: t._id,
      });
      if (exists) continue;

      const n = await Notification.create({
        ownerId,
        type: 'due_today',
        taskId: t._id,
        message: `Due today: ${t.title}`,
      });
      created.push(n._id);
    }

    res.json({ success: true, createdCount: created.length });
  })
);

module.exports = router;

