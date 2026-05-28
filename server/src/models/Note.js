// server/src/models/Note.js

const mongoose = require('mongoose')

const noteSchema = new mongoose.Schema({
  user:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  lectureId: { type: String, required: true },
  courseId:  { type: String, required: true },
  text:      { type: String, default: '' },
}, { timestamps: true })

// One note per user per lecture
noteSchema.index({ user: true, lectureId: true }, { unique: true })

module.exports = mongoose.model('Note', noteSchema)