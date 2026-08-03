// src/store/slices/friendsSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authService from '../../services/authService';
import friendService from '../../services/friendService';

export const fetchFriends = createAsyncThunk(
  'friends/fetch',
  async () => authService.getFriends()
);

export const fetchPendingRequests = createAsyncThunk(
  'friends/pending',
  async () => friendService.getPendingRequests()
);

const friendsSlice = createSlice({
  name: 'friends',
  initialState: {
    list: [],
    pendingRequests: [],
    sentRequests: [],
    loading: false,
  },
  reducers: {
    addFriend: (state, action) => {
      state.list.push(action.payload);
    },
    removeFriend: (state, action) => {
      state.list = state.list.filter(f => f._id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFriends.fulfilled, (state, action) => {
        state.list = action.payload.friends || [];
      })
      .addCase(fetchPendingRequests.fulfilled, (state, action) => {
        state.pendingRequests = action.payload.requests || [];
      });
  },
});

export const { addFriend, removeFriend } = friendsSlice.actions;

export const selectFriends = (state) => state.friends.list;
export const selectPendingRequests = (state) => state.friends.pendingRequests;

export default friendsSlice.reducer;