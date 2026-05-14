const { Lecture } = require('../models/Lecture');
const { Course } = require('../models/Course');

// ── Helper: verify folder belongs to logged in user
async function verifyFolderOwner(courseId, userId) {
  const course = await Course.findOne({ _id: courseId, createdBy: userId });
  return course;
}

// GET ALL LECTURES OF A FOLDER
async function listByCourse(req, res) {
  try {
    const { courseId } = req.params;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ error: 'Folder not found' });
    }

    const lectures = await Lecture.find({ course: courseId })
      .sort({ createdAt: 1 });

    return res.json({ lectures });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// CREATE LECTURE — any logged in user (must own the folder)
async function create(req, res) {
  try {
    const { courseId } = req.params;
    const { title, description, videoUrl, durationSec } = req.body;

    // Verify folder belongs to this user
    const course = await verifyFolderOwner(courseId, req.user.id);
    if (!course) {
      return res.status(403).json({ error: 'You do not own this folder' });
    }

    if (!title || !videoUrl) {
      return res.status(400).json({ error: 'Title and video URL required' });
    }

    if (!videoUrl.includes('youtube.com') && !videoUrl.includes('youtu.be')) {
      return res.status(400).json({ error: 'Invalid YouTube URL' });
    }

    const lecture = await Lecture.create({
      course: courseId,
      title,
      description,
      videoUrl,
      durationSec,
    });

    return res.status(201).json({ lecture });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// UPDATE LECTURE — any logged in user (must own the folder)
async function updateLecture(req, res) {
  try {
    const { courseId, lectureId } = req.params;

    // Verify folder belongs to this user
    const course = await verifyFolderOwner(courseId, req.user.id);
    if (!course) {
      return res.status(403).json({ error: 'You do not own this folder' });
    }

    const lecture = await Lecture.findOne({ _id: lectureId, course: courseId });
    if (!lecture) {
      return res.status(404).json({ error: 'Lecture not found' });
    }

    const { title, description, videoUrl, durationSec } = req.body;

    if (title !== undefined) lecture.title = title;
    if (description !== undefined) lecture.description = description;
    if (videoUrl !== undefined) lecture.videoUrl = videoUrl;
    if (durationSec !== undefined) lecture.durationSec = durationSec;

    await lecture.save();
    return res.json({ lecture });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// DELETE LECTURE — any logged in user (must own the folder)
async function deleteLecture(req, res) {
  try {
    const { courseId, lectureId } = req.params;

    // Verify folder belongs to this user
    const course = await verifyFolderOwner(courseId, req.user.id);
    if (!course) {
      return res.status(403).json({ error: 'You do not own this folder' });
    }

    const lecture = await Lecture.findOne({ _id: lectureId, course: courseId });
    if (!lecture) {
      return res.status(404).json({ error: 'Lecture not found' });
    }

    await lecture.deleteOne();
    return res.json({ message: 'Lecture deleted successfully' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// MARK LECTURE COMPLETE / INCOMPLETE (TOGGLE) — unchanged
async function markComplete(req, res) {
  try {
    const { courseId, lectureId } = req.params;
    const userId = req.user.id;

    const lecture = await Lecture.findOne({ _id: lectureId, course: courseId });
    if (!lecture) {
      return res.status(404).json({ error: 'Lecture not found' });
    }

    const alreadyDone = lecture.completedBy.some(
      (id) => id.toString() === userId
    );

    if (alreadyDone) {
      lecture.completedBy = lecture.completedBy.filter(
        (id) => id.toString() !== userId
      );
    } else {
      lecture.completedBy.push(userId);
    }

    await lecture.save();
    return res.json({ lecture, completed: !alreadyDone });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

module.exports = {
  listByCourse,
  create,
  updateLecture,
  deleteLecture,
  markComplete,
};