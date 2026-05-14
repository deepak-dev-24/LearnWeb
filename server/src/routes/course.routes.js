const { Router } = require('express');
const { requireAuth } = require('../middleware/auth');
const {
  listCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
} = require('../controllers/course.controller');

const router = Router();

// ALL ROUTES REQUIRE LOGIN
router.get('/', requireAuth, listCourses);
router.get('/:id', requireAuth, getCourse);
router.post('/', requireAuth, createCourse);
router.put('/:id', requireAuth, updateCourse);
router.delete('/:id', requireAuth, deleteCourse);

module.exports = router;