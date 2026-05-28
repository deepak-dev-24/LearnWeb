<div align="center">

# 📚 LearnWeb

**A personal, distraction-free study platform built for students who take learning seriously.**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-learnweb--fawn.vercel.app-06b6d4?style=for-the-badge&logo=vercel&logoColor=white)](https://learnweb-fawn.vercel.app/)
[![Backend API](https://img.shields.io/badge/Backend%20API-Render-10b981?style=for-the-badge&logo=render&logoColor=white)](https://learnweb-backend.onrender.com/api/health)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB%20Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/atlas)
[![License](https://img.shields.io/badge/License-MIT-8b5cf6?style=for-the-badge)](./LICENSE)
[![Node](https://img.shields.io/badge/Node.js->=18.0.0-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)

<br/>

> No ads. No recommendations. No infinite scroll.
> Just you, your study material, and your progress.

<br/>

[🚀 Live Demo](https://learnweb-fawn.vercel.app/) · [📖 API Docs](#-api-overview) · [🐛 Report Bug](https://github.com/deepak-dev-24/LearnWeb/issues) · [✨ Request Feature](https://github.com/deepak-dev-24/LearnWeb/issues)

</div>

---

## 📸 Screenshots

> Add your screenshots inside `/docs/screenshots/` and they will appear here.

| Landing Page | Dashboard | Video Player |
|---|---|---|
| ![Landing](docs/screenshots/landing.png) | ![Dashboard](docs/screenshots/dashboard.png) | ![Player](docs/screenshots/player.png) |

| Study Feed | Daily Plan | Offline Study |
|---|---|---|
| ![Feed](docs/screenshots/feed.png) | ![Plan](docs/screenshots/plan.png) | ![Offline](docs/screenshots/offline.png) |

---

## 📌 About The Project

**LearnWeb** is not a course marketplace or an LMS. It is a **private, personal study workspace** built for students who want to learn deeply without distractions.

Modern learning platforms are designed to keep you scrolling — not studying. LearnWeb is the opposite. It gives you a clean, focused environment to organize your own material, watch lectures without interruption, track every study session, and stay accountable to yourself every single day.

### Core Philosophy

- 🔒 **Private by default** — every folder, lecture, note, and session belongs only to you
- 🚫 **Zero distractions** — no ads, no recommendations, no infinite scroll
- ⏱️ **Focus-first design** — Pomodoro timers and focus modes built directly into the study experience
- 📊 **Progress-aware** — every session, task, and completed lecture is recorded and visible

---

## ✨ Features

### 📁 Study Folders
- Create personal subject folders — DSA, Backend, Java, anything
- Upload custom thumbnails via Cloudinary
- Circular progress ring showing lecture completion percentage
- Per-folder study goals saved for quick reference
- Edit and delete folders with strict ownership enforcement

### 🎬 Lecture Management and Video Player
- Add YouTube video links to any folder
- Fully distraction-free player — no navbar, no footer, no suggestions
- Supports YouTube, Vimeo, and MP4/WebM formats
- **Focus Mode** — fullscreen video with everything else hidden
- **Pomodoro Timer** — 25 / 45 / 60 min presets plus custom duration
- Idle detection after 90 seconds with a nudge to refocus
- Tab-switch warning banner when you leave the page
- **Notes panel** — synced to database per user per lecture, accessible from any browser or device
- Mark lectures complete or incomplete, tracked individually per user

### 📺 Study Feed
- YouTube-style grid showing all your lectures across all folders
- Filter lectures by folder name
- Real YouTube thumbnails auto-extracted from video URL
- Click any lecture to jump directly into the video player

### ✅ Daily Plan
- Add daily study tasks with a description and time estimate
- Check off tasks as you complete them, with timestamps saved
- Visual progress bar and live completion statistics
- Confetti animation when all tasks for the day are done
- 14-day task history with expandable day-by-day cards

### ⏱️ Offline Study — Pomodoro System
- 25-minute focused study sessions followed by 5-minute breaks
- Large animated SVG clock ring with ambient particle effects
- Animated "Watching Eye" to maintain a sense of accountability
- Random motivational messages appear every 5 minutes during a session
- Tab-switch detection with an instant warning banner
- After every session a reflection form appears:
  - What did you study? (free text)
  - How focused were you? (Fully / Mostly / Not really)
- All session data saved to database
- Automatically moves to summary after 4 sessions
- Full study journal available at `/study-history`

### 📊 Dashboard
- Live stats — folder count, total lectures, tasks completed this week
- Quick action buttons for all major features
- Full study folder preview grid

### 👤 Profile and Auth
- JWT-based authentication with 7-day token expiry
- Password reset via name and email verification — no OTP needed
- Persistent login across page refreshes via localStorage
- Clean profile page showing account information and workspace stats

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| [React 18](https://react.dev/) | UI framework |
| [Vite](https://vitejs.dev/) | Build tool and dev server |
| [Redux Toolkit](https://redux-toolkit.js.org/) | Global state management — 7 slices |
| [React Router v6](https://reactrouter.com/) | Client-side routing |
| [Axios](https://axios-http.com/) | HTTP client with auth token interceptor |
| [Tailwind CSS](https://tailwindcss.com/) | Utility-first styling |
| [React Icons](https://react-icons.github.io/react-icons/) | Icon library |

### Backend
| Technology | Purpose |
|---|---|
| [Node.js](https://nodejs.org/) | Runtime environment |
| [Express.js](https://expressjs.com/) | REST API framework — CommonJS |
| [MongoDB Atlas](https://www.mongodb.com/atlas) | Cloud database |
| [Mongoose](https://mongoosejs.com/) | ODM for schema and model management |
| [JSON Web Token](https://jwt.io/) | Stateless authentication |
| [bcryptjs](https://github.com/dcodeIO/bcrypt.js) | Password hashing |
| [Cloudinary](https://cloudinary.com/) | Image and media storage |
| [Morgan](https://github.com/expressjs/morgan) | HTTP request logging |

### Deployment
| Service | Purpose |
|---|---|
| [Vercel](https://vercel.com/) | Frontend hosting with auto-deploy |
| [Render](https://render.com/) | Backend API hosting |
| [MongoDB Atlas](https://www.mongodb.com/atlas) | Cloud database hosting |

---

## 🏗️ Architecture Overview

```
LearnWeb/
├── client/                           # React + Vite frontend
│   ├── public/
│   └── src/
│       ├── components/
│       │   ├── ImageUpload.jsx       # Cloudinary upload component
│       │   ├── Layout.jsx            # Passthrough layout wrapper
│       │   └── ProtectedRoute.jsx    # JWT-based route guard
│       ├── features/                 # Redux Toolkit — 7 slices
│       │   ├── auth/authSlice.js
│       │   ├── folder/folderSlice.js
│       │   ├── lectures/lectureSlice.js
│       │   ├── feed/feedSlice.js
│       │   ├── note/noteSlice.js
│       │   ├── plan/planSlice.js
│       │   └── studySession/studySessionSlice.js
│       ├── lib/
│       │   └── api.js                # Axios instance + Bearer token injection
│       ├── pages/                    # 14 application pages
│       │   ├── Dashboard.jsx
│       │   ├── StudyFolders.jsx
│       │   ├── FolderDetail.jsx
│       │   ├── CreateFolder.jsx
│       │   ├── ManageFolder.jsx
│       │   ├── Lectures.jsx
│       │   ├── VideoPlayer.jsx
│       │   ├── Feed.jsx
│       │   ├── DailyPlan.jsx
│       │   ├── OfflineStudy.jsx
│       │   ├── StudyHistory.jsx
│       │   ├── Profile.jsx
│       │   ├── Login.jsx
│       │   └── Signup.jsx
│       ├── App.jsx                   # Routes + Navigation + Home page
│       ├── store.js                  # Redux store configuration
│       └── main.jsx                  # React entry point
│
└── server/                           # Node.js + Express backend
    └── src/
        ├── config/
        │   └── cloudinary.js         # Cloudinary SDK configuration
        ├── controllers/
        │   ├── auth.controller.js
        │   ├── course.controller.js
        │   ├── lecture.controller.js
        │   ├── note.Controller.js
        │   ├── plan.Controller.js
        │   └── studySession.Controller.js
        ├── middleware/
        │   └── auth.js               # requireAuth + requireRole
        ├── models/
        │   ├── User.js
        │   ├── Course.js
        │   ├── Lecture.js
        │   ├── Note.js
        │   ├── Plan.js
        │   └── StudySession.js
        ├── routes/
        │   ├── auth.routes.js
        │   ├── course.routes.js
        │   ├── lecture.routes.js
        │   ├── note.Routes.js
        │   ├── feed.routes.js
        │   ├── plan.routes.js
        │   ├── studySession.Routes.js
        │   ├── file.routes.js
        │   └── health.routes.js
        ├── app.js                    # Express app — middleware + route mounting
        └── server.js                 # HTTP server entry point
```

### Request Flow

```
Browser — React
    │
    ├── Redux Thunk dispatched
    │
    └── Axios — lib/api.js
            │  Authorization: Bearer <JWT>
            ▼
        Express API — Render
            │
            ├── CORS → JSON Parser → Morgan Logger
            │
            ├── requireAuth middleware
            │   └── jwt.verify() → req.user = { id, role }
            │
            ├── Route → Controller → Mongoose Query
            │
            └── MongoDB Atlas
                    │
                    └── JSON Response → Redux state → UI re-render
```

---

## 🗄️ Database Models

| Model | Key Fields | Purpose |
|---|---|---|
| `User` | `name`, `email`, `passwordHash`, `role` | Authentication and identity |
| `Course` | `title`, `description`, `thumbnail`, `createdBy` | Study folders per user |
| `Lecture` | `course`, `title`, `videoUrl`, `durationSec`, `completedBy[]` | Videos inside folders |
| `Note` | `user`, `lectureId`, `courseId`, `text` | Per-user per-lecture notes synced to database |
| `Plan` | `user`, `date`, `tasks[]`, `completedCount`, `totalCount` | Daily task planner |
| `StudySession` | `user`, `date`, `sessionNumber`, `duration`, `reflection`, `focusRating` | Offline Pomodoro sessions |

---

## 🔌 API Overview

All routes are prefixed with `/api`. Protected routes require `Authorization: Bearer <token>`.

### Auth
```
POST   /api/auth/signup              Register new account
POST   /api/auth/login               Login with email and password
POST   /api/auth/verify-reset        Verify identity for password reset
POST   /api/auth/reset-password      Set new password
```

### Study Folders
```
GET    /api/courses                  Get all folders for logged-in user
GET    /api/courses/:id              Get single folder — must be owner
POST   /api/courses                  Create new folder
PUT    /api/courses/:id              Update folder — must be owner
DELETE /api/courses/:id              Delete folder — must be owner
```

### Lectures
```
GET    /api/courses/:courseId/lectures                        Get all lectures in folder
POST   /api/courses/:courseId/lectures                        Add lecture — must own folder
PUT    /api/courses/:courseId/lectures/:lectureId             Edit lecture
DELETE /api/courses/:courseId/lectures/:lectureId             Delete lecture
POST   /api/courses/:courseId/lectures/:lectureId/complete    Toggle complete or incomplete
```

### Notes
```
GET    /api/notes/:lectureId         Get saved note for a lecture
POST   /api/notes                    Save or update note for a lecture
DELETE /api/notes/:lectureId         Delete note for a lecture
```

### Feed
```
GET    /api/feed                     All lectures from user's own folders
```

### Daily Plan
```
GET    /api/plans/today              Get or auto-create today's plan
POST   /api/plans/task               Add task with text and estimate
PATCH  /api/plans/task/:taskId       Toggle task complete
DELETE /api/plans/task/:taskId       Delete task
GET    /api/plans/history            Last 14 days of plans
```

### Offline Study Sessions
```
POST   /api/study-sessions           Save a completed Pomodoro session
GET    /api/study-sessions/today     Get today's sessions
GET    /api/study-sessions/history   Last 14 days grouped by date
```

### Files
```
POST   /api/files/upload             Upload image to Cloudinary
```

### Health
```
GET    /api/health                   Server health check
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js `>= 18.0.0`
- npm or yarn
- MongoDB Atlas account — free tier works
- Cloudinary account — free tier works

### 1. Clone the Repository

```bash
git clone https://github.com/deepak-dev-24/LearnWeb.git
cd LearnWeb
```

### 2. Setup the Backend

```bash
cd server
npm install
```

Create a `.env` file inside `server/`:

```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/learnweb
JWT_SECRET=your_strong_jwt_secret_here
CLIENT_URL=http://localhost:5173
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Start the backend:

```bash
npm run dev
```

Runs at `http://localhost:5000`

### 3. Setup the Frontend

```bash
cd ../client
npm install
```

Create a `.env` file inside `client/`:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend:

```bash
npm run dev
```

Runs at `http://localhost:5173`

### 4. Verify Everything Works

- Open `http://localhost:5173` in your browser
- Check backend: `http://localhost:5000/api/health`
- Create an account and build your first study folder

---

## 🌐 Deployment

### Frontend → Vercel

1. Push your code to GitHub
2. Import the repo in [Vercel](https://vercel.com/)
3. Set root directory to `client`
4. Add environment variable:
```
   VITE_API_URL=https://learnweb-backend.onrender.com/api
```
5. Deploy — Vercel auto-builds on every push to main

### Backend → Render

1. Create a new Web Service in [Render](https://render.com/)
2. Connect your GitHub repository
3. Set root directory to `server`
4. Build command: `npm install`
5. Start command: `npm start`
6. Add all variables from `.env` example above
7. Deploy

### Database → MongoDB Atlas

1. Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a database user with read and write permissions
3. Whitelist `0.0.0.0/0` for Render dynamic IPs
4. Paste the connection string into `MONGODB_URI`

---

## 🔐 Authentication Flow

```
User submits login or signup form
            │
            ▼
POST /api/auth/login or /signup
            │
            ▼
Server verifies credentials → issues JWT (7 day expiry)
            │
            ▼
Frontend stores { user, token } in localStorage
            │
            ▼
authSlice reads localStorage on every page refresh
            │
            ▼
setAuthToken(token) injects Bearer header into all Axios requests
            │
            ▼
requireAuth middleware verifies token on every protected API route
            │
            ▼
req.user = { id, role } is available in every controller
```

---

## 🗺️ Application Modules

| Module | Pages | Description |
|---|---|---|
| Authentication | Login, Signup | JWT auth, password reset, session persistence |
| Study Folders | StudyFolders, FolderDetail, CreateFolder, ManageFolder | Personal subject organization |
| Lecture and Player | Lectures, VideoPlayer | Distraction-free video with Pomodoro timer and database notes |
| Study Feed | Feed | Unified grid of all personal lectures |
| Daily Plan | DailyPlan | Task management with 14-day history |
| Offline Study | OfflineStudy, StudyHistory | Pomodoro sessions with reflection journal |
| Dashboard and Profile | Dashboard, Profile | Stats overview and account management |

---

## 🔮 Future Improvements

- [ ] Edit profile — name and email update via API
- [ ] Lecture duration tracking and watch time analytics
- [ ] Weekly study streak visualization
- [ ] Mobile app using React Native
- [ ] Keyboard shortcuts throughout Focus Mode
- [ ] Export study history as PDF
- [ ] Dark and light theme toggle
- [ ] Drag and drop lecture reordering
- [ ] Email reminders for daily plan

---

## 👤 Author

**Deepak Kumar**

- GitHub: [@deepak-dev-24](https://github.com/deepak-dev-24)
- Live Project: [learnweb-fawn.vercel.app](https://learnweb-fawn.vercel.app/)

---

## 📄 License

This project is licensed under the **MIT License**.
See the [LICENSE](./LICENSE) file for details.

---

## 🙏 Acknowledgements

- [React](https://react.dev/) and [Vite](https://vitejs.dev/) for the frontend foundation
- [MongoDB Atlas](https://www.mongodb.com/atlas) for free cloud database hosting
- [Cloudinary](https://cloudinary.com/) for media management
- [Vercel](https://vercel.com/) and [Render](https://render.com/) for free-tier deployment
- Every student who needs a distraction-free place to actually study

---

<div align="center">

**Built with focus. For students who mean it.**

⭐ Star this repository if LearnWeb helped you study better.

</div>