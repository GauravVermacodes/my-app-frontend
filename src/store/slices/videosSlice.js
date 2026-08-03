// src/store/slices/videosSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../api/axios';   // ✅ Use TASK2's axios

// ═══════════════════════════════════════════════════════════
//  ASYNC THUNKS
// ═══════════════════════════════════════════════════════════

/**
 * Fetch all videos (with optional category & search filters)
 */
export const fetchVideos = createAsyncThunk(
  'videos/fetchAll',
  async ({ category = 'All', search = '' } = {}, { rejectWithValue }) => {
    try {
      const params = {};
      if (search) params.search = search;
      if (category !== 'All') params.category = category;

      const { data } = await API.get('/videos', { params });
      return {
        videos: data.videos || [],
        category,
        search,
      };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load videos');
    }
  }
);

/**
 * Fetch single video by ID
 */
export const fetchVideoById = createAsyncThunk(
  'videos/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await API.get(`/videos/${id}`);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load video');
    }
  }
);

/**
 * Add video to watch history
 */
export const addToHistory = createAsyncThunk(
  'videos/addToHistory',
  async (videoId, { rejectWithValue }) => {
    try {
      await API.post(`/history/${videoId}`);
      return videoId;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to add to history');
    }
  }
);

/**
 * Download video
 */
export const downloadVideo = createAsyncThunk(
  'videos/download',
  async (videoId, { rejectWithValue }) => {
    try {
      const { data } = await API.post(`/downloads/${videoId}`);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Download failed');
    }
  }
);

/**
 * Report inappropriate video
 */
export const reportVideo = createAsyncThunk(
  'videos/report',
  async ({ videoId, reason, description }, { rejectWithValue }) => {
    try {
      await API.post(`/videos/${videoId}/report`, { reason, description });
      return { videoId, reason };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to report');
    }
  }
);

/**
 * Upload new video (with progress tracking)
 */
export const uploadVideo = createAsyncThunk(
  'videos/upload',
  async (formData, { rejectWithValue, dispatch }) => {
    try {
      const { data } = await API.post('/videos/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (event) => {
          const progress = Math.round((event.loaded * 100) / event.total);
          dispatch(setUploadProgress(progress));
        },
      });
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Upload failed');
    }
  }
);

// ═══════════════════════════════════════════════════════════
//  SLICE
// ═══════════════════════════════════════════════════════════
const videosSlice = createSlice({
  name: 'videos',
  initialState: {
    // Data
    list: [],
    currentVideo: null,
    hiddenVideos: [],   // "Not interested" — persists across sessions

    // Filters
    activeCategory: 'All',
    searchQuery: '',
    filters: {
      sort: 'newest',
    },

    // Status
    loading: false,
    error: null,
    lastFetchedAt: null,

    // Upload state
    uploadProgress: 0,
    uploading: false,
  },
  reducers: {
    // ✅ Category filter
    setActiveCategory: (state, action) => {
      state.activeCategory = action.payload;
    },

    // ✅ Search query
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },

    // ✅ Extra filters (sort, etc.)
    setFilter: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },

    // ✅ Hide video (Not interested)
    hideVideo: (state, action) => {
      if (!state.hiddenVideos.includes(action.payload)) {
        state.hiddenVideos.push(action.payload);
      }
      state.list = state.list.filter(v => v._id !== action.payload);
    },

    // ✅ Clear all hidden videos
    clearHiddenVideos: (state) => {
      state.hiddenVideos = [];
    },

    // ✅ Upload progress
    setUploadProgress: (state, action) => {
      state.uploadProgress = action.payload;
    },

    // ✅ Clear current video (when leaving player)
    clearCurrentVideo: (state) => {
      state.currentVideo = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // ── FETCH ALL ─────────────────────────────────────
      .addCase(fetchVideos.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVideos.fulfilled, (state, action) => {
        state.loading = false;
        // Filter out hidden videos
        state.list = action.payload.videos.filter(
          v => !state.hiddenVideos.includes(v._id)
        );
        state.lastFetchedAt = Date.now();
      })
      .addCase(fetchVideos.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ── FETCH BY ID ───────────────────────────────────
      .addCase(fetchVideoById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchVideoById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentVideo = action.payload.video || action.payload;
      })
      .addCase(fetchVideoById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ── UPLOAD ────────────────────────────────────────
      .addCase(uploadVideo.pending, (state) => {
        state.uploading = true;
        state.uploadProgress = 0;
        state.error = null;
      })
      .addCase(uploadVideo.fulfilled, (state, action) => {
        state.uploading = false;
        state.uploadProgress = 100;
        // Add new video to the beginning of list
        if (action.payload.video) {
          state.list.unshift(action.payload.video);
        }
      })
      .addCase(uploadVideo.rejected, (state, action) => {
        state.uploading = false;
        state.uploadProgress = 0;
        state.error = action.payload;
      });
  },
});

// ═══════════════════════════════════════════════════════════
//  ✅ ACTIONS EXPORT (single export, all actions)
// ═══════════════════════════════════════════════════════════
export const {
  setActiveCategory,
  setSearchQuery,
  setFilter,
  hideVideo,
  clearHiddenVideos,
  setUploadProgress,
  clearCurrentVideo,
} = videosSlice.actions;

// ═══════════════════════════════════════════════════════════
//  ✅ SELECTORS (no duplicates)
// ═══════════════════════════════════════════════════════════

// Video data
export const selectAllVideos = (state) => state.videos.list;
export const selectCurrentVideo = (state) => state.videos.currentVideo;
export const selectHiddenVideos = (state) => state.videos.hiddenVideos;

// Filters
export const selectActiveCategory = (state) => state.videos.activeCategory;
export const selectSearchQuery = (state) => state.videos.searchQuery;
export const selectFilters = (state) => state.videos.filters;

// Status
export const selectVideosLoading = (state) => state.videos.loading;
export const selectVideosError = (state) => state.videos.error;
export const selectLastFetchedAt = (state) => state.videos.lastFetchedAt;

// Upload
export const selectUploadProgress = (state) => state.videos.uploadProgress;
export const selectIsUploading = (state) => state.videos.uploading;

// ═══════════════════════════════════════════════════════════
//  ✅ COMPUTED SELECTORS
// ═══════════════════════════════════════════════════════════

// Shorts (videos ≤ 60 seconds)
export const selectShorts = (state) =>
  state.videos.list.filter(
    v => v.duration && v.duration > 0 && v.duration <= 60
  );

// Regular videos (> 60 seconds or no duration)
export const selectRegularVideos = (state) =>
  state.videos.list.filter(v => !v.duration || v.duration > 60);

// Premium videos only
export const selectPremiumVideos = (state) =>
  state.videos.list.filter(v => v.isPremium);

// Video count
export const selectVideoCount = (state) => state.videos.list.length;

export default videosSlice.reducer;