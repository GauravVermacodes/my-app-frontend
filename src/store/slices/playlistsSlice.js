// src/store/slices/playlistsSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../api/axios';

// Fetch user playlists
export const fetchMyPlaylists = createAsyncThunk(
  'playlists/fetchMy',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await API.get('/playlists/my');
      return data.playlists || [];
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed');
    }
  }
);

// Add video to playlist
export const addVideoToPlaylist = createAsyncThunk(
  'playlists/addVideo',
  async ({ playlistId, videoId }, { rejectWithValue }) => {
    try {
      await API.post(`/playlists/${playlistId}/add/${videoId}`);
      return { playlistId, videoId };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed');
    }
  }
);

// Remove video from playlist
export const removeVideoFromPlaylist = createAsyncThunk(
  'playlists/removeVideo',
  async ({ playlistId, videoId }, { rejectWithValue }) => {
    try {
      await API.delete(`/playlists/${playlistId}/remove/${videoId}`);
      return { playlistId, videoId };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed');
    }
  }
);

// Create playlist and add video
export const createPlaylistWithVideo = createAsyncThunk(
  'playlists/createAndAdd',
  async ({ name, videoId }, { rejectWithValue }) => {
    try {
      const { data } = await API.post('/playlists', { name });
      const newPlaylist = data.playlist || data;
      
      if (videoId) {
        await API.post(`/playlists/${newPlaylist._id}/add/${videoId}`);
      }
      
      return { playlist: newPlaylist, videoId };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed');
    }
  }
);

const playlistsSlice = createSlice({
  name: 'playlists',
  initialState: {
    list: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearPlaylists: (state) => {
      state.list = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyPlaylists.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMyPlaylists.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchMyPlaylists.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add video
      .addCase(addVideoToPlaylist.fulfilled, (state, action) => {
        const { playlistId, videoId } = action.payload;
        const playlist = state.list.find(p => p._id === playlistId);
        if (playlist && !playlist.videos?.some(v => (v._id || v) === videoId)) {
          playlist.videos = [...(playlist.videos || []), videoId];
        }
      })
      // Remove video
      .addCase(removeVideoFromPlaylist.fulfilled, (state, action) => {
        const { playlistId, videoId } = action.payload;
        const playlist = state.list.find(p => p._id === playlistId);
        if (playlist) {
          playlist.videos = (playlist.videos || []).filter(
            v => (v._id || v) !== videoId
          );
        }
      })
      // Create and add
      .addCase(createPlaylistWithVideo.fulfilled, (state, action) => {
        const { playlist, videoId } = action.payload;
        state.list.push({
          ...playlist,
          videos: videoId ? [videoId] : [],
        });
      });
  },
});

export const selectMyPlaylists = (state) => state.playlists.list;
export const selectPlaylistsLoading = (state) => state.playlists.loading;

export const { clearPlaylists } = playlistsSlice.actions;

export default playlistsSlice.reducer;