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
const corsOptions = {
  origin: [
    'http://localhost:5173', // Local development
    'http://localhost:3000', // Alternative local port
    'https://edunexus-git-main-deepennehra-projects.vercel.app', // Your Vercel deployment
    'https://*.vercel.app', // All Vercel subdomains
    process.env.CLIENT_URL // Environment variable for production
  ].filter(Boolean), // Remove undefined values
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

app.use(cors(corsOptions));
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


