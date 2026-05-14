const { Router } = require('express')
const { signup, login, verifyUserForReset, resetPassword } = require('../controllers/auth.controller')

const router = Router()

router.post('/signup', signup)
router.post('/login', login)
router.post('/verify-reset', verifyUserForReset)
router.post('/reset-password', resetPassword)

module.exports = router