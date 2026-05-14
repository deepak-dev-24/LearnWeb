const { Router } = require('express')
const { requireAuth } = require('../middleware/auth')
const { cloudinary, upload } = require('../config/cloudinary')

const router = Router()

router.post('/upload', requireAuth, upload.single('image'), async (req, res) => {
  try {
    console.log('UPLOAD HIT')
    console.log('FILE:', req.file)
    
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' })
    }

    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'learnweb', resource_type: 'image' },
        (error, result) => {
          if (error) {
            console.log('CLOUDINARY ERROR:', error)
            reject(error)
          }
          else resolve(result)
        }
      )
      stream.end(req.file.buffer)
    })

    res.json({ url: result.secure_url })
  } catch (err) {
    console.log('UPLOAD ERROR:', err.message)
    res.status(500).json({ error: err.message })
  }
})

module.exports = router  // ← ADD THIS