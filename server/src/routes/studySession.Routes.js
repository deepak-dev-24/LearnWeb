// server/src/routes/studySession.Routes.js
const express = require('express')
const { requireAuth } = require('../middleware/auth')
const { saveSession, getTodaySessions, getHistory } = require('../controllers/studySession.Controller')

const router = express.Router()

// Apply requireAuth to ALL routes
router.use(requireAuth)

router.post('/', saveSession)
router.get('/today', getTodaySessions)
router.get('/history', getHistory)

module.exports = router