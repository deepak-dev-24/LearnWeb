import { configureStore } from '@reduxjs/toolkit'
import authReducer from './features/auth/authSlice'
import coursesReducer from './features/folder/folderSlice'
import lecturesReducer from './features/lectures/lectureSlice'
import feedReducer from './features/feed/feedSlice'
import planReducer from './features/plan/planSlice'   // ← ADD THIS
import studySessionReducer from './features/studySession/studySessionSlice'
import notesReducer from './features/notes/noteSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    courses: coursesReducer,
    lectures: lecturesReducer,
    feed: feedReducer,
    plan: planReducer,   // ← ADD THIS
    studySession: studySessionReducer,
    notes: notesReducer,
  },
})