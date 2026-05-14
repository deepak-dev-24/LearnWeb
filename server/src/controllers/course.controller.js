const { Course } = require('../models/Course');

// GET ALL COURSES — only logged in user's own folders
async function listCourses(req, res) {
  try {
    const courses = await Course.find({ createdBy: req.user.id })
      .populate('createdBy', 'name')
      .select('title description thumbnail createdBy createdAt updatedAt');

    return res.json({ courses });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// GET SINGLE COURSE — only if it belongs to logged in user
async function getCourse(req, res) {
  try {
    const course = await Course.findOne({
      _id: req.params.id,
      createdBy: req.user.id
    }).populate('createdBy', 'name');

    if (!course) {
      return res.status(404).json({ error: 'Folder not found' });
    }

    return res.json({ course });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// CREATE COURSE — any logged in user
async function createCourse(req, res) {
  try {
    const { title, description, thumbnail } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const course = await Course.create({
      title,
      description: description || '',
      thumbnail: thumbnail || '',
      createdBy: req.user.id,
    });

    return res.status(201).json({ course });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// UPDATE COURSE — only if it belongs to logged in user
async function updateCourse(req, res) {
  try {
    const course = await Course.findOne({
      _id: req.params.id,
      createdBy: req.user.id
    });

    if (!course) {
      return res.status(404).json({ error: 'Folder not found' });
    }

    const { title, description, thumbnail } = req.body;

    if (title !== undefined) course.title = title;
    if (description !== undefined) course.description = description;
    if (thumbnail !== undefined) course.thumbnail = thumbnail;

    await course.save();
    return res.json({ course });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// DELETE COURSE — only if it belongs to logged in user
async function deleteCourse(req, res) {
  try {
    const course = await Course.findOne({
      _id: req.params.id,
      createdBy: req.user.id
    });

    if (!course) {
      return res.status(404).json({ error: 'Folder not found' });
    }

    await course.deleteOne();
    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

module.exports = {
  listCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
};