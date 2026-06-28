const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 60 },
  },
  { timestamps: true }
);

categorySchema.index({ ownerId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Category', categorySchema);

