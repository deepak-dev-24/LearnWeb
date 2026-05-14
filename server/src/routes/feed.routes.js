const { Router } = require('express');
const { requireAuth } = require('../middleware/auth');
const { Lecture } = require('../models/Lecture');
const { Course } = require('../models/Course');

const router = Router();

// GET /api/feed — only logged in user's own lectures
router.get('/', requireAuth, async (req, res) => {
  try {
    // Step 1 — find all folders belonging to this user
    const userCourses = await Course.find({ createdBy: req.user.id }).select('_id')
    const courseIds = userCourses.map(c => c._id)

    // Step 2 — find lectures only from those folders
    const lectures = await Lecture.find({ course: { $in: courseIds } })
      .populate('course', 'title description thumbnail')
      .sort({ createdAt: -1 })
      .limit(50)

    return res.json({ lectures })
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
})

module.exports = router