const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
// const session = require('express-session');

const healthRouter = require('./routes/health.routes');
const authRouter = require('./routes/auth.routes');
const courseRouter = require('./routes/course.routes');
const lectureRouter = require('./routes/lecture.routes');
const fileRouter = require('./routes/file.routes');
const feedRouter = require('./routes/feed.routes');
const planRouter = require('./routes/plan.routes');
const studySessionRouter = require('./routes/studySession.Routes')

const app = express();

// CORS configuration
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.CLIENT_URL,
];

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));

app.use('/api/health', healthRouter);
app.use('/api/auth', authRouter);
app.use('/api/courses', courseRouter);
app.use('/api/courses/:courseId/lectures', lectureRouter);
app.use('/api/files', fileRouter)
app.use('/api/feed', feedRouter);
app.use('/api/plans', planRouter);
app.use('/api/study-sessions', studySessionRouter)

module.exports = { app };


