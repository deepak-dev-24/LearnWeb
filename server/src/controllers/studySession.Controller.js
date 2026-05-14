// server/src/controllers/studySession.Controller.js
const StudySession = require('../models/StudySession')

// Helper — today's date string
const today = () => new Date().toISOString().split('T')[0]

// ── SAVE a completed session (called after reflection)
const saveSession = async (req, res) => {
  try {
    const { duration, reflection, focusRating } = req.body

    if (!duration || !focusRating) {
      return res.status(400).json({ error: 'duration and focusRating are required' })
    }

    // Count today's sessions to assign session number
    const countToday = await StudySession.countDocuments({
      user: req.user.id,
      date: today(),
    })

    const session = await StudySession.create({
      user: req.user.id,
      date: today(),
      sessionNumber: countToday + 1,
      duration,
      reflection: reflection || '',
      focusRating,
    })

    res.status(201).json({ session })
  } catch (err) {
    console.log('SAVE SESSION ERROR:', err.message)
    res.status(500).json({ error: err.message })
  }
}

// ── GET today's sessions
const getTodaySessions = async (req, res) => {
  try {
    const sessions = await StudySession.find({
      user: req.user.id,
      date: today(),
    }).sort({ sessionNumber: 1 })

    res.json({ sessions })
  } catch (err) {
    res.status(500).json({ error: "Failed to load today's sessions" })
  }
}

// ── GET last 14 days history
const getHistory = async (req, res) => {
  try {
    const dates = []
    for (let i = 0; i < 14; i++) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      dates.push(d.toISOString().split('T')[0])
    }

    const sessions = await StudySession.find({
      user: req.user.id,
      date: { $in: dates },
    }).sort({ date: -1, sessionNumber: 1 })

    // Group sessions by date
    const grouped = {}
    sessions.forEach((s) => {
      if (!grouped[s.date]) grouped[s.date] = []
      grouped[s.date].push(s)
    })

    res.json({ history: grouped })
  } catch (err) {
    res.status(500).json({ error: 'Failed to load history' })
  }
}

module.exports = { saveSession, getTodaySessions, getHistory }