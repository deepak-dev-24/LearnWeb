// src/features/notes/noteSlice.js

import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { api } from '../../lib/api'

// ── Thunks ──────────────────────────────────────

export const fetchNote = createAsyncThunk('notes/fetch', async (lectureId, { rejectWithValue }) => {
  try {
    const { data } = await api.get(`/notes/${lectureId}`)
    return data.note
  } catch (err) {
    return rejectWithValue(err.response?.data || { error: 'Failed to fetch note' })
  }
})

export const saveNote = createAsyncThunk('notes/save', async ({ lectureId, courseId, text }, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/notes', { lectureId, courseId, text })
    return data.note
  } catch (err) {
    return rejectWithValue(err.response?.data || { error: 'Failed to save note' })
  }
})

export const deleteNote = createAsyncThunk('notes/delete', async (lectureId, { rejectWithValue }) => {
  try {
    await api.delete(`/notes/${lectureId}`)
    return lectureId
  } catch (err) {
    return rejectWithValue(err.response?.data || { error: 'Failed to delete note' })
  }
})

// ── Slice ──────────────────────────────────────

const noteSlice = createSlice({
  name: 'notes',
  initialState: {
    current: null,   // current lecture's note
    loading: false,
    saving: false,
    error: null,
  },
  reducers: {
    clearNote: (state) => {
      state.current = null
    }
  },
  extraReducers: (builder) => {
    builder
      // fetchNote
      .addCase(fetchNote.pending, (s) => { s.loading = true; s.error = null })
      .addCase(fetchNote.fulfilled, (s, a) => { s.loading = false; s.current = a.payload })
      .addCase(fetchNote.rejected, (s, a) => { s.loading = false; s.error = a.payload?.error || 'Failed' })

      // saveNote
      .addCase(saveNote.pending, (s) => { s.saving = true })
      .addCase(saveNote.fulfilled, (s, a) => { s.saving = false; s.current = a.payload })
      .addCase(saveNote.rejected, (s, a) => { s.saving = false; s.error = a.payload?.error || 'Failed' })

      // deleteNote
      .addCase(deleteNote.pending, (s) => { s.loading = true })
      .addCase(deleteNote.fulfilled, (s) => { s.loading = false; s.current = null })
      .addCase(deleteNote.rejected, (s, a) => { s.loading = false; s.error = a.payload?.error || 'Failed' })
  }
})

export const { clearNote } = noteSlice.actions
export default noteSlice.reducer