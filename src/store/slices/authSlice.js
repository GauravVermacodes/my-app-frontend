// src/store/slices/authSlice.js
import { createSlice } from '@reduxjs/toolkit';

const savedUser = localStorage.getItem('user');
const savedToken = localStorage.getItem('token');

const initialState = {
  user: savedUser ? JSON.parse(savedUser) : null,
  token: savedToken || null,
  isAuthenticated: !!savedToken,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;
      state.isAuthenticated = true;
      state.error = null;
      
      // Persist
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', token);
    },
    
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      
      // Clear
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    },
    
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      localStorage.setItem('user', JSON.stringify(state.user));
    },
    
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const { loginSuccess, logout, updateUser, setLoading, setError } = authSlice.actions;

// Selectors
export const selectUser = (state) => state.auth.user;
export const selectToken = (state) => state.auth.token;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;

export default authSlice.reducer;