// server/src/routes/plan.Routes.js

const express = require('express')
const { requireAuth } = require('../middleware/auth')
const { getTodayPlan, addTask, toggleTask, deleteTask, getHistory } = require('../controllers/plan.Controller')

const router = express.Router()

// Apply requireAuth to ALL routes
router.use(requireAuth)

router.get('/today', getTodayPlan)
router.post('/task', addTask)
router.patch('/task/:taskId', toggleTask)
router.delete('/task/:taskId', deleteTask)
router.get('/history', getHistory)

module.exports = router