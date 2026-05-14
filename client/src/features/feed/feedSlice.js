import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { api } from '../../lib/api'

export const fetchFeed = createAsyncThunk(
  'feed/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/feed')
      return data.lectures
    } catch (err) {
      return rejectWithValue(err.response?.data || { error: 'Failed to load feed' })
    }
  }
)

const feedSlice = createSlice({
  name: 'feed',
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchFeed.pending, (s) => { s.loading = true; s.error = null })
      .addCase(fetchFeed.fulfilled, (s, a) => { s.loading = false; s.items = a.payload })
      .addCase(fetchFeed.rejected, (s, a) => { s.loading = false; s.error = a.payload?.error || 'Failed' })
  }
})

export default feedSlice.reducer