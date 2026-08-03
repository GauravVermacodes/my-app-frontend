// src/store/index.js
import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';

import authReducer from './slices/authSlice';
import videosReducer from './slices/videosSlice';
import roomsReducer from './slices/roomsSlice';
import notificationsReducer from './slices/notificationsSlice';
import friendsReducer from './slices/friendsSlice';
import uiReducer from './slices/uiSlice';
import { apiSlice } from './api/apiSlice';
import playlistsReducer from './slices/playlistsSlice'
import watchListReducer from './slices/watchListSlice';   // ✅ ADD

export const store = configureStore({
  reducer: {
    auth: authReducer,
    videos: videosReducer,
    playlists: playlistsReducer,   // ← This line!
    rooms: roomsReducer,
    notifications: notificationsReducer,
    friends: friendsReducer,
    ui: uiReducer,
    watchList: watchListReducer,   // ✅ ADD
    [apiSlice.reducerPath]: apiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }).concat(apiSlice.middleware),
  devTools: import.meta.env.MODE !== 'production',
});

// Enable refetchOnFocus/refetchOnReconnect
setupListeners(store.dispatch);

export default store;