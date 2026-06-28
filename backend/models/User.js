const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    passwordHash: { type: String, required: true, minlength: 60, maxlength: 255 },

    profileImageUrl: { type: String, default: '' },
    theme: { type: String, enum: ['light', 'dark'], default: 'dark' },

    // Simple relationship points to “team” (assignments) via Task.assignedMemberIds
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);

