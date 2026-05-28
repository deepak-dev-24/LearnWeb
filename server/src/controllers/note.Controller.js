// server/src/controllers/note.Controller.js

const Note = require('../models/Note')

// ── GET note for a lecture
const getNote = async (req, res) => {
  try {
    const { lectureId } = req.params
    const note = await Note.findOne({ user: req.user.id, lectureId })
    res.json({ note: note || null })
  } catch (err) {
    res.status(500).json({ error: 'Failed to get note' })
  }
}

// ── SAVE (create or update) note for a lecture
const saveNote = async (req, res) => {
  try {
    const { lectureId, courseId, text } = req.body

    if (!lectureId || !courseId) {
      return res.status(400).json({ error: 'lectureId and courseId are required' })
    }

    // upsert — create if not exists, update if exists
    const note = await Note.findOneAndUpdate(
      { user: req.user.id, lectureId },
      { text, courseId, user: req.user.id, lectureId },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    )

    res.json({ note })
  } catch (err) {
    console.log('SAVE NOTE ERROR:', err.message)
    res.status(500).json({ error: 'Failed to save note' })
  }
}

// ── DELETE note for a lecture
const deleteNote = async (req, res) => {
  try {
    const { lectureId } = req.params
    await Note.findOneAndDelete({ user: req.user.id, lectureId })
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete note' })
  }
}

module.exports = { getNote, saveNote, deleteNote }