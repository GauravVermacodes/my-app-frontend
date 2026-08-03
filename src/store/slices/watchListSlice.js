// src/store/slices/watchListSlice.js
import { createSlice } from '@reduxjs/toolkit';

// Load from localStorage on startup
const savedList = JSON.parse(
  localStorage.getItem('watchList') || '[]'
);

const watchListSlice = createSlice({
  name: 'watchList',
  initialState: {
    videos: savedList,
    currentlyPlaying: null,
  },
  reducers: {
    // Add video to watch list
    addToWatchList: (state, action) => {
      const video = action.payload;
      // Avoid duplicates
      if (!state.videos.some(v => v._id === video._id)) {
        state.videos.push({
          _id: video._id,
          title: video.title,
          thumbnailUrl: video.thumbnailUrl,
          videoUrl: video.videoUrl,
          duration: video.duration,
          uploader: video.uploader,
          views: video.views,
          addedAt: Date.now(),
        });
        // Save to localStorage
        localStorage.setItem(
          'watchList',
          JSON.stringify(state.videos)
        );
      }
    },

    // Remove video from watch list
    removeFromWatchList: (state, action) => {
      state.videos = state.videos.filter(
        v => v._id !== action.payload
      );
      localStorage.setItem(
        'watchList',
        JSON.stringify(state.videos)
      );
    },

    // Set currently playing video
    setCurrentlyPlaying: (state, action) => {
      state.currentlyPlaying = action.payload;
    },

    // Clear entire watch list
    clearWatchList: (state) => {
      state.videos = [];
      state.currentlyPlaying = null;
      localStorage.removeItem('watchList');
    },

    // Reorder videos (drag & drop)
    reorderWatchList: (state, action) => {
      const { fromIndex, toIndex } = action.payload;
      const [moved] = state.videos.splice(fromIndex, 1);
      state.videos.splice(toIndex, 0, moved);
      localStorage.setItem(
        'watchList',
        JSON.stringify(state.videos)
      );
    },

    // Play next video in list
    playNext: (state) => {
      if (!state.currentlyPlaying || state.videos.length === 0) return;
      const currentIndex = state.videos.findIndex(
        v => v._id === state.currentlyPlaying
      );
      if (currentIndex < state.videos.length - 1) {
        state.currentlyPlaying = state.videos[currentIndex + 1]._id;
      }
    },
  },
});

// Actions
export const {
  addToWatchList,
  removeFromWatchList,
  setCurrentlyPlaying,
  clearWatchList,
  reorderWatchList,
  playNext,
} = watchListSlice.actions;

// Selectors
export const selectWatchList = (state) => state.watchList.videos;
export const selectWatchListCount = (state) => state.watchList.videos.length;
export const selectCurrentlyPlaying = (state) => state.watchList.currentlyPlaying;
export const selectIsInWatchList = (videoId) => (state) =>
  state.watchList.videos.some(v => v._id === videoId);

export default watchListSlice.reducer;