// src/store/slices/uiSlice.js
import { createSlice } from '@reduxjs/toolkit';

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    sidebarCollapsed: false,
    theme: localStorage.getItem('theme') || 'auto',
    activeModal: null,
    toasts: [],
  },
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    setSidebar: (state, action) => {
      state.sidebarCollapsed = action.payload;
    },
    setTheme: (state, action) => {
      state.theme = action.payload;
      localStorage.setItem('theme', action.payload);
    },
    openModal: (state, action) => {
      state.activeModal = action.payload;
    },
    closeModal: (state) => {
      state.activeModal = null;
    },
  },
});

export const { toggleSidebar, setSidebar, setTheme, openModal, closeModal } = uiSlice.actions;

export const selectSidebarCollapsed = (state) => state.ui.sidebarCollapsed;
export const selectTheme = (state) => state.ui.theme;
export const selectActiveModal = (state) => state.ui.activeModal;

export default uiSlice.reducer;