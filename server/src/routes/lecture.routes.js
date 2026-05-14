const { Router } = require('express');
const { requireAuth } = require('../middleware/auth');
const {
  listByCourse,
  create,
  updateLecture,
  deleteLecture,
  markComplete,
} = require('../controllers/lecture.controller');

const router = Router({ mergeParams: true });

// Get all lectures of a folder
router.get('/', requireAuth, listByCourse);

// Create lecture — any logged in user
router.post('/', requireAuth, create);

// Update lecture — any logged in user
router.put('/:lectureId', requireAuth, updateLecture);

// Delete lecture — any logged in user
router.delete('/:lectureId', requireAuth, deleteLecture);

// Mark lecture complete/incomplete — any logged in user
router.post('/:lectureId/complete', requireAuth, markComplete);

module.exports = router;