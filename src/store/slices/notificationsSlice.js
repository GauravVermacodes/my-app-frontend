// src/store/slices/notificationsSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import notificationService from '../../services/notificationService';

export const fetchNotifications = createAsyncThunk(
  'notifications/fetch',
  async () => notificationService.getNotifications()
);

export const fetchUnreadCount = createAsyncThunk(
  'notifications/unreadCount',
  async () => notificationService.getUnreadCount()
);

export const markAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (id) => {
    await notificationService.markAsRead(id);
    return id;
  }
);

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState: {
    list: [],
    unreadCount: 0,
    loading: false,
  },
  reducers: {
    addNotification: (state, action) => {
      // Avoid duplicates
      if (!state.list.some(n => n._id === action.payload._id)) {
        state.list.unshift(action.payload);
        state.unreadCount += 1;
      }
    },
    clearNotifications: (state) => {
      state.list = [];
      state.unreadCount = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.list = action.payload.notifications || [];
        state.unreadCount = action.payload.unreadCount || 0;
      })
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload.unreadCount || 0;
      })
      .addCase(markAsRead.fulfilled, (state, action) => {
        const notif = state.list.find(n => n._id === action.payload);
        if (notif && !notif.isRead) {
          notif.isRead = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      });
  },
});

export const { addNotification, clearNotifications } = notificationsSlice.actions;

export const selectNotifications = (state) => state.notifications.list;
export const selectUnreadCount = (state) => state.notifications.unreadCount;

export default notificationsSlice.reducer;