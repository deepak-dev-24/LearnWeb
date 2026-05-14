// src/features/plan/planSlice.js

import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { api } from '../../lib/api'

// ── Thunks ──────────────────────────────────────

export const fetchTodayPlan = createAsyncThunk('plan/fetchToday', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/plans/today')
    return data.plan
  } catch (err) {
    return rejectWithValue(err.response?.data || { error: 'Failed to load plan' })
  }
})

export const addTask = createAsyncThunk('plan/addTask', async ({ text, estimate }, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/plans/task', { text, estimate })
    return data.plan
  } catch (err) {
    return rejectWithValue(err.response?.data || { error: 'Failed to add task' })
  }
})

export const toggleTask = createAsyncThunk('plan/toggleTask', async (taskId, { rejectWithValue }) => {
  try {
    const { data } = await api.patch(`/plans/task/${taskId}`)
    return data.plan
  } catch (err) {
    return rejectWithValue(err.response?.data || { error: 'Failed to toggle task' })
  }
})

export const deleteTask = createAsyncThunk('plan/deleteTask', async (taskId, { rejectWithValue }) => {
  try {
    const { data } = await api.delete(`/plans/task/${taskId}`)
    return data.plan
  } catch (err) {
    return rejectWithValue(err.response?.data || { error: 'Failed to delete task' })
  }
})

export const fetchHistory = createAsyncThunk('plan/fetchHistory', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/plans/history')
    return data.plans
  } catch (err) {
    return rejectWithValue(err.response?.data || { error: 'Failed to load history' })
  }
})

// ── Slice ──────────────────────────────────────

const planSlice = createSlice({
  name: 'plan',
  initialState: {
    today: null,
    history: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetchTodayPlan
      .addCase(fetchTodayPlan.pending, (s) => { s.loading = true; s.error = null })
      .addCase(fetchTodayPlan.fulfilled, (s, a) => { s.loading = false; s.today = a.payload })
      .addCase(fetchTodayPlan.rejected, (s, a) => { s.loading = false; s.error = a.payload?.error || 'Failed' })

      // addTask
      .addCase(addTask.pending, (s) => { s.loading = true })
      .addCase(addTask.fulfilled, (s, a) => { s.loading = false; s.today = a.payload })
      .addCase(addTask.rejected, (s, a) => { s.loading = false; s.error = a.payload?.error || 'Failed' })

      // toggleTask
      .addCase(toggleTask.pending, (s) => { s.loading = false })
      .addCase(toggleTask.fulfilled, (s, a) => { s.today = a.payload })
      .addCase(toggleTask.rejected, (s, a) => { s.error = a.payload?.error || 'Failed' })

      // deleteTask
      .addCase(deleteTask.pending, (s) => { s.loading = false })
      .addCase(deleteTask.fulfilled, (s, a) => { s.today = a.payload })
      .addCase(deleteTask.rejected, (s, a) => { s.error = a.payload?.error || 'Failed' })

      // fetchHistory
      .addCase(fetchHistory.pending, (s) => { s.loading = true })
      .addCase(fetchHistory.fulfilled, (s, a) => { s.loading = false; s.history = a.payload })
      .addCase(fetchHistory.rejected, (s, a) => { s.loading = false; s.error = a.payload?.error || 'Failed' })
  }
})

export default planSlice.reducer