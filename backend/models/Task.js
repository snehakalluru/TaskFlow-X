const mongoose = require('mongoose');

const priorities = ['low', 'medium', 'high', 'urgent'];
const statuses = ['todo', 'inprogress', 'review', 'completed'];

const taskSchema = new mongoose.Schema(
  {
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },

    title: { type: String, required: true, trim: true, minlength: 2, maxlength: 140 },
    description: { type: String, default: '', maxlength: 5000 },

    status: { type: String, enum: statuses, default: 'todo', index: true },
    priority: { type: String, enum: priorities, default: 'medium', index: true },

    dueDate: { type: Date, default: null, index: true },

    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },

    tags: [{ type: String, trim: true, maxlength: 30 }],

    assignedMemberIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

    // For kanban ordering (optional)
    kanbanOrder: { type: Number, default: 0, index: true },

    completedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

taskSchema.index({ ownerId: 1, status: 1 });

module.exports = mongoose.model('Task', taskSchema);

