import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { api } from '../../lib/api'

// Fetch lectures
export const fetchLectures = createAsyncThunk(
  'lectures/fetchByCourse',
  async (courseId, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/courses/${courseId}/lectures`)
      return { courseId, lectures: data.lectures }
    } catch (err) {
      return rejectWithValue(err.response?.data || { error: 'Failed to load lectures' })
    }
  }
)

// Mark lecture complete / incomplete
export const markLectureComplete = createAsyncThunk(
  'lectures/markComplete',
  async ({ courseId, lectureId }, { rejectWithValue }) => {
    try {
      const { data } = await api.post(
        `/courses/${courseId}/lectures/${lectureId}/complete`
      )
      return { courseId, lectureId, lecture: data.lecture, completed: data.completed }
    } catch (err) {
      return rejectWithValue(err.response?.data || { error: 'Failed to update' })
    }
  }
)

// Update lecture
export const updateLecture = createAsyncThunk(
  'lectures/update',
  async ({ courseId, lectureId, data }, { rejectWithValue }) => {
    try {
      const { data: updatedLecture } = await api.put(
        `/courses/${courseId}/lectures/${lectureId}`,
        data
      )
      return { courseId, lectureId, lecture: updatedLecture.lecture }
    } catch (err) {
      return rejectWithValue(err.response?.data || { error: 'Failed to update lecture' })
    }
  }
)

// Delete lecture
export const deleteLecture = createAsyncThunk(
  'lectures/delete',
  async ({ courseId, lectureId }, { rejectWithValue }) => {
    try {
      await api.delete(`/courses/${courseId}/lectures/${lectureId}`)
      return { courseId, lectureId }
    } catch (err) {
      return rejectWithValue(err.response?.data || { error: 'Failed to delete lecture' })
    }
  }
)

const lecturesSlice = createSlice({
  name: 'lectures',
  initialState: {
    byCourseId: {},
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchLectures.pending, (s) => { s.loading = true; s.error = null })
      .addCase(fetchLectures.fulfilled, (s, a) => {
        s.loading = false
        s.byCourseId[a.payload.courseId] = a.payload.lectures
      })
      .addCase(fetchLectures.rejected, (s, a) => {
        s.loading = false
        s.error = a.payload?.error || 'Failed'
      })

      // Mark complete
      .addCase(markLectureComplete.fulfilled, (s, a) => {
        const { courseId, lecture } = a.payload
        if (s.byCourseId[courseId]) {
          s.byCourseId[courseId] = s.byCourseId[courseId].map((l) =>
            l._id === lecture._id ? lecture : l
          )
        }
      })

      // Update
      .addCase(updateLecture.pending, (s) => { s.loading = true; s.error = null })
      .addCase(updateLecture.fulfilled, (s, a) => {
        s.loading = false
        const { courseId, lectureId, lecture } = a.payload
        if (s.byCourseId[courseId]) {
          s.byCourseId[courseId] = s.byCourseId[courseId].map((l) =>
            l._id === lectureId ? lecture : l
          )
        }
      })
      .addCase(updateLecture.rejected, (s, a) => {
        s.loading = false
        s.error = a.payload?.error || 'Failed'
      })

      // Delete
      .addCase(deleteLecture.pending, (s) => { s.loading = true; s.error = null })
      .addCase(deleteLecture.fulfilled, (s, a) => {
        s.loading = false
        const { courseId, lectureId } = a.payload
        if (s.byCourseId[courseId]) {
          s.byCourseId[courseId] = s.byCourseId[courseId].filter(
            (l) => l._id !== lectureId
          )
        }
      })
      .addCase(deleteLecture.rejected, (s, a) => {
        s.loading = false
        s.error = a.payload?.error || 'Failed'
      })
  },
})

export default lecturesSlice.reducer