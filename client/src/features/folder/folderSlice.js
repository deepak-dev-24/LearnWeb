import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { api } from '../../lib/api'

export const fetchCourses = createAsyncThunk('courses/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/courses')
    return data.courses
  } catch (err) {
    return rejectWithValue(err.response?.data || { error: 'Failed to load courses' })
  }
})

export const fetchCourse = createAsyncThunk('courses/fetchOne', async (id, { rejectWithValue }) => {
  try {
    const { data } = await api.get(`/courses/${id}`)
    return data.course
  } catch (err) {
    return rejectWithValue(err.response?.data || { error: 'Failed to load course' })
  }
})

export const enrollInCourse = createAsyncThunk('courses/enroll', async (id, { rejectWithValue }) => {
  try {
    const { data } = await api.post(`/courses/${id}/enroll`)
    return { id, enrolled: data.enrolled }
  } catch (err) {
    return rejectWithValue(err.response?.data || { error: 'Enroll failed' })
  }
})

// Fetch enrolled courses for students
export const fetchEnrolledCourses = createAsyncThunk('courses/fetchEnrolled', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/courses/my/enrolled')
    return data
  } catch (err) {
    return rejectWithValue(err.response?.data || { error: 'Failed to fetch enrolled courses' })
  }
})

// New: Update a course
export const updateCourse = createAsyncThunk('courses/update', async ({ id, data }, { rejectWithValue }) => {
  try {
    const { data: updated } = await api.put(`/courses/${id}`, data)
    return updated.course // Assume backend returns { course: updated }
  } catch (err) {
    return rejectWithValue(err.response?.data || { error: 'Failed to update course' })
  }
})

// New: Delete a course
export const deleteCourse = createAsyncThunk('courses/delete', async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/courses/${id}`)
    return id
  } catch (err) {
    return rejectWithValue(err.response?.data || { error: 'Failed to delete course' })
  }
})

const courseSlice = createSlice({
  name: 'courses',
  initialState: {
    items: [],
    current: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchEnrolledCourses.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchEnrolledCourses.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload.courses
      })
      .addCase(fetchEnrolledCourses.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload?.error || 'Failed to fetch enrolled courses'
      })

      .addCase(fetchCourses.pending, (s)=>{ s.loading = true; s.error = null })
      .addCase(fetchCourses.fulfilled, (s, a)=>{ s.loading = false; s.items = a.payload })
      .addCase(fetchCourses.rejected, (s, a)=>{ s.loading = false; s.error = a.payload?.error || 'Failed' })

      .addCase(fetchCourse.pending, (s)=>{ s.loading = true; s.error = null; s.current = null })
      .addCase(fetchCourse.fulfilled, (s, a)=>{ s.loading = false; s.current = a.payload })
      .addCase(fetchCourse.rejected, (s, a)=>{ s.loading = false; s.error = a.payload?.error || 'Failed' })

      .addCase(enrollInCourse.pending, (s)=>{ s.loading = true })
      .addCase(enrollInCourse.fulfilled, (s)=>{ s.loading = false })
      .addCase(enrollInCourse.rejected, (s, a)=>{ s.loading = false; s.error = a.payload?.error || 'Failed' })

      // New: Update cases
      .addCase(updateCourse.pending, (s) => { s.loading = true; s.error = null })
      .addCase(updateCourse.fulfilled, (s, a) => {
        s.loading = false
        s.items = s.items.map(c => c._id === a.payload._id ? a.payload : c) // Update in list
        if (s.current?._id === a.payload._id) s.current = a.payload // Update current if open
      })
      .addCase(updateCourse.rejected, (s, a) => { s.loading = false; s.error = a.payload?.error || 'Failed' })

      // New: Delete cases
      .addCase(deleteCourse.pending, (s) => { s.loading = true; s.error = null })
      .addCase(deleteCourse.fulfilled, (s, a) => {
        s.loading = false
        s.items = s.items.filter(c => c._id !== a.payload) // Remove from list
        if (s.current?._id === a.payload) s.current = null // Close if open
      })
      .addCase(deleteCourse.rejected, (s, a) => { s.loading = false; s.error = a.payload?.error || 'Failed' })
  }
})

export default courseSlice.reducer