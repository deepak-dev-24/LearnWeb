// server/src/models/StudySession.js
const mongoose = require('mongoose')

const studySessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    date: {
      type: String, // YYYY-MM-DD
      required: true,
    },
    sessionNumber: {
      type: Number,
      required: true,
    },
    duration: {
      type: Number, // in minutes
      required: true,
    },
    reflection: {
      type: String,
      default: '',
    },
    focusRating: {
      type: String,
      enum: ['Fully', 'Mostly', 'Not really'],
      required: true,
    },
    completedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
)

studySessionSchema.index({ user: 1, date: 1 })

module.exports = mongoose.model('StudySession', studySessionSchema)