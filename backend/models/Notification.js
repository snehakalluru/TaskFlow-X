const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },

    type: {
      type: String,
      enum: ['due_today', 'overdue', 'task_completed', 'reminder'],
      required: true,
    },

    taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', default: null },

    message: { type: String, required: true, maxlength: 400 },
    readAt: { type: Date, default: null },

    scheduledAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true }
);

notificationSchema.index({ ownerId: 1, readAt: 1 });

module.exports = mongoose.model('Notification', notificationSchema);

