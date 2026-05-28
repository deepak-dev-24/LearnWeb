// server/src/routes/note.Routes.js

const express = require('express')
const { requireAuth } = require('../middleware/auth')
const { getNote, saveNote, deleteNote } = require('../controllers/note.Controller')

const router = express.Router()

router.use(requireAuth)

router.get('/:lectureId', getNote)      // GET note for a lecture
router.post('/', saveNote)              // POST save/update note
router.delete('/:lectureId', deleteNote) // DELETE note for a lecture

module.exports = router