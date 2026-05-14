// server/src/models/Plan.js

const mongoose = require('mongoose')

const taskSchema = new mongoose.Schema({
  text: { type: String, required: true, trim: true },
  estimate: { type: String, default: '' }, // e.g. "30 min", "1 hour"
  completed: { type: Boolean, default: false },
  completedAt: { type: Date, default: null },
}, { _id: true })

const planSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: String, required: true }, // "YYYY-MM-DD" format
  tasks: [taskSchema],
  reflection: { type: String, default: '' }, // end of day note (optional)
  completedCount: { type: Number, default: 0 },
  totalCount: { type: Number, default: 0 },
}, { timestamps: true })

// One plan per user per day
planSchema.index({ user: true, date: true }, { unique: true })

module.exports = mongoose.model('Plan', planSchema)