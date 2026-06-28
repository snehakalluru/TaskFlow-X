const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { asyncHandler } = require('../utils/asyncHandler');
const Task = require('../models/Task');
const Category = require('../models/Category');

const router = express.Router();

function startOfWeek(d) {
  const x = new Date(d);
  const day = (x.getDay() + 6) % 7; // make Monday=0
  x.setDate(x.getDate() - day);
  x.setHours(0, 0, 0, 0);
  return x;
}

router.get(
  '/summary',
  requireAuth,
  asyncHandler(async (req, res) => {
    const ownerId = req.user._id;

    const [total, completed, pending] = await Promise.all([
      Task.countDocuments({ ownerId }),
      Task.countDocuments({ ownerId, status: 'completed' }),
      Task.countDocuments({ ownerId, status: { $ne: 'completed' } }),
    ]);

    res.json({ success: true, data: { total, completed, pending } });
  })
);

router.get(
  '/productivity',
  requireAuth,
  asyncHandler(async (req, res) => {
    const ownerId = req.user._id;
    const { range = 'weekly' } = req.query;

    const now = new Date();

    if (range === 'monthly') {
      // last 6 months
      const months = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now);
        d.setMonth(d.getMonth() - i);
        months.push({
          key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
          start: new Date(d.getFullYear(), d.getMonth(), 1),
          end: new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999),
        });
      }

      const labels = months.map((m) => m.key);

      const completedSeries = [];
      const pendingSeries = [];

      for (const m of months) {
        const completedCount = await Task.countDocuments({
          ownerId,
          status: 'completed',
          completedAt: { $gte: m.start, $lte: m.end },
        });

        // Pending: due date within month and not completed
        const pendingCount = await Task.countDocuments({
          ownerId,
          status: { $ne: 'completed' },
          dueDate: { $gte: m.start, $lte: m.end },
        });

        completedSeries.push(completedCount);
        pendingSeries.push(pendingCount);
      }

      res.json({ success: true, data: { labels, completedSeries, pendingSeries } });
      return;
    }

    // weekly: current week days
    const start = startOfWeek(now);
    const labels = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      labels.push(d.toLocaleDateString(undefined, { weekday: 'short' }));
    }

    const completedSeries = [];
    const pendingSeries = [];

    for (let i = 0; i < 7; i++) {
      const dayStart = new Date(start);
      dayStart.setDate(dayStart.getDate() + i);
      dayStart.setHours(0, 0, 0, 0);

      const dayEnd = new Date(dayStart);
      dayEnd.setHours(23, 59, 59, 999);

      const completedCount = await Task.countDocuments({
        ownerId,
        status: 'completed',
        completedAt: { $gte: dayStart, $lte: dayEnd },
      });

      const pendingCount = await Task.countDocuments({
        ownerId,
        status: { $ne: 'completed' },
        dueDate: { $gte: dayStart, $lte: dayEnd },
      });

      completedSeries.push(completedCount);
      pendingSeries.push(pendingCount);
    }

    res.json({ success: true, data: { labels, completedSeries, pendingSeries } });
  })
);

router.get(
  '/categories',
  requireAuth,
  asyncHandler(async (req, res) => {
    const ownerId = req.user._id;

    const cats = await Category.find({ ownerId }).select('_id name').lean();
    const catIds = cats.map((c) => c._id);

    const agg = await Task.aggregate([
      { $match: { ownerId, categoryId: { $in: catIds } } },
      { $group: { _id: '$categoryId', count: { $sum: 1 } } },
    ]);

    const map = new Map(agg.map((a) => [String(a._id), a.count]));
    const labels = cats.map((c) => c.name);
    const series = cats.map((c) => map.get(String(c._id)) || 0);

    res.json({ success: true, data: { labels, series } });
  })
);

module.exports = router;

