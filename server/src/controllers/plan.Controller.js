// server/src/controllers/plan.Controller.js

const Plan = require('../models/Plan')

// Helper — today's date string
const today = () => new Date().toISOString().split('T')[0]

// ── GET today's plan (or create empty one)
const getTodayPlan = async (req, res) => {
  try {
    let plan = await Plan.findOne({ user: req.user.id, date: today() })
    if (!plan) {
      plan = await Plan.create({ user: req.user.id, date: today(), tasks: [] })
    }
    res.json({ plan })
  } catch (err) {
    res.status(500).json({ error: 'Failed to load today\'s plan' })
  }
}

// ── ADD a task to today's plan
const addTask = async (req, res) => {
  try {
    const { text, estimate } = req.body
    if (!text?.trim()) return res.status(400).json({ error: 'Task text is required' })

    let plan = await Plan.findOne({ user: req.user.id, date: today() })
    if (!plan) plan = await Plan.create({ user: req.user.id, date: today(), tasks: [] })

    plan.tasks.push({ text: text.trim(), estimate: estimate || '' })
    plan.totalCount = plan.tasks.length
    await plan.save()

    res.json({ plan })
  } catch (err) {
    console.log('ADD TASK ERROR:', err.message)
    res.status(500).json({ error: err.message })
  }
}

// ── TOGGLE task complete/incomplete
const toggleTask = async (req, res) => {
  try {
    const { taskId } = req.params
    const plan = await Plan.findOne({ user: req.user.id, date: today() })
    if (!plan) return res.status(404).json({ error: 'Plan not found' })

    const task = plan.tasks.id(taskId)
    if (!task) return res.status(404).json({ error: 'Task not found' })

    task.completed = !task.completed
    task.completedAt = task.completed ? new Date() : null

    plan.completedCount = plan.tasks.filter(t => t.completed).length
    plan.totalCount = plan.tasks.length
    await plan.save()

    res.json({ plan })
  } catch (err) {
    res.status(500).json({ error: 'Failed to toggle task' })
  }
}

// ── DELETE a task
const deleteTask = async (req, res) => {
  try {
    const { taskId } = req.params
    const plan = await Plan.findOne({ user: req.user.id, date: today() })
    if (!plan) return res.status(404).json({ error: 'Plan not found' })

    plan.tasks = plan.tasks.filter(t => t._id.toString() !== taskId)  // ← fixed: t._id not t.id
    plan.completedCount = plan.tasks.filter(t => t.completed).length
    plan.totalCount = plan.tasks.length
    await plan.save()

    res.json({ plan })
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete task' })
  }
}

// ── GET last 7 days history
const getHistory = async (req, res) => {
  try {
    const plans = await Plan.find({ user: req.user.id })
      .sort({ date: -1 })
      .limit(14)
      .select('date tasks completedCount totalCount createdAt')

    res.json({ plans })
  } catch (err) {
    res.status(500).json({ error: 'Failed to load history' })
  }
}

module.exports = { getTodayPlan, addTask, toggleTask, deleteTask, getHistory }