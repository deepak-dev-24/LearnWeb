const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const healthRouter = require('./routes/health.routes');
const authRouter = require('./routes/auth.routes');
const courseRouter = require('./routes/course.routes');
const lectureRouter = require('./routes/lecture.routes');
const fileRouter = require('./routes/file.routes');
const feedRouter = require('./routes/feed.routes');
const planRouter = require('./routes/plan.routes');
const studySessionRouter = require('./routes/studySession.Routes');
const noteRouter = require('./routes/note.Routes')

const app = express();

// SIMPLE PRODUCTION CORS
app.use(cors({
  origin: true,
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));

// Health Route
app.use('/api/health', healthRouter);

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/courses', courseRouter);
app.use('/api/courses/:courseId/lectures', lectureRouter);
app.use('/api/files', fileRouter);
app.use('/api/feed', feedRouter);
app.use('/api/plans', planRouter);
app.use('/api/study-sessions', studySessionRouter);
app.use('/api/notes', noteRouter)

// Root Route
app.get('/', (req, res) => {
  res.send('LearnWeb Backend Running 🚀');
});

module.exports = { app };