// src/features/studySession/studySessionSlice.js
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { api } from '../../lib/api'

// ── Thunks ──────────────────────────────────────

export const saveSession = createAsyncThunk('studySession/save', async ({ duration, reflection, focusRating }, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/study-sessions', { duration, reflection, focusRating })
    return data.session
  } catch (err) {
    return rejectWithValue(err.response?.data || { error: 'Failed to save session' })
  }
})

export const fetchTodaySessions = createAsyncThunk('studySession/fetchToday', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/study-sessions/today')
    return data.sessions
  } catch (err) {
    return rejectWithValue(err.response?.data || { error: 'Failed to load today\'s sessions' })
  }
})

export const fetchHistory = createAsyncThunk('studySession/fetchHistory', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/study-sessions/history')
    return data.history
  } catch (err) {
    return rejectWithValue(err.response?.data || { error: 'Failed to load history' })
  }
})

// ── Slice ──────────────────────────────────────

const studySessionSlice = createSlice({
  name: 'studySession',
  initialState: {
    todaySessions: [],
    history: {},
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // saveSession
      .addCase(saveSession.pending, (s) => { s.loading = true; s.error = null })
      .addCase(saveSession.fulfilled, (s, a) => {
        s.loading = false
        s.todaySessions.push(a.payload)
      })
      .addCase(saveSession.rejected, (s, a) => { s.loading = false; s.error = a.payload?.error || 'Failed' })

      // fetchTodaySessions
      .addCase(fetchTodaySessions.pending, (s) => { s.loading = true; s.error = null })
      .addCase(fetchTodaySessions.fulfilled, (s, a) => { s.loading = false; s.todaySessions = a.payload })
      .addCase(fetchTodaySessions.rejected, (s, a) => { s.loading = false; s.error = a.payload?.error || 'Failed' })

      // fetchHistory
      .addCase(fetchHistory.pending, (s) => { s.loading = true })
      .addCase(fetchHistory.fulfilled, (s, a) => { s.loading = false; s.history = a.payload })
      .addCase(fetchHistory.rejected, (s, a) => { s.loading = false; s.error = a.payload?.error || 'Failed' })
  }
})

export default studySessionSlice.reducer