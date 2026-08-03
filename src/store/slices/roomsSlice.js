// src/store/slices/roomsSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import roomService from '../../services/roomService';

export const fetchMyRooms = createAsyncThunk(
  'rooms/fetchMy',
  async (_, { rejectWithValue }) => {
    try {
      return await roomService.getUserRooms();
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed');
    }
  }
);

export const createRoom = createAsyncThunk(
  'rooms/create',
  async (roomData, { rejectWithValue }) => {
    try {
      return await roomService.createRoom(roomData);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed');
    }
  }
);

export const deleteRoom = createAsyncThunk(
  'rooms/delete',
  async (roomId, { rejectWithValue }) => {
    try {
      await roomService.deleteRoom(roomId);
      return roomId;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed');
    }
  }
);

const roomsSlice = createSlice({
  name: 'rooms',
  initialState: {
    hostedRooms: [],
    joinedRooms: [],
    currentRoom: null,
    loading: false,
    error: null,
  },
  reducers: {
    setCurrentRoom: (state, action) => {
      state.currentRoom = action.payload;
    },
    clearCurrentRoom: (state) => {
      state.currentRoom = null;
    },
    updateRoomLocally: (state, action) => {
      const { roomId, updates } = action.payload;
      const hosted = state.hostedRooms.find(r => r._id === roomId);
      if (hosted) Object.assign(hosted, updates);
      const joined = state.joinedRooms.find(r => r._id === roomId);
      if (joined) Object.assign(joined, updates);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyRooms.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMyRooms.fulfilled, (state, action) => {
        state.loading = false;
        state.hostedRooms = action.payload.hostedRooms || [];
        state.joinedRooms = action.payload.joinedRooms || [];
      })
      .addCase(fetchMyRooms.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createRoom.fulfilled, (state, action) => {
        state.hostedRooms.unshift(action.payload.room);
      })
      .addCase(deleteRoom.fulfilled, (state, action) => {
        state.hostedRooms = state.hostedRooms.filter(r => r._id !== action.payload);
        state.joinedRooms = state.joinedRooms.filter(r => r._id !== action.payload);
      });
  },
});

export const { setCurrentRoom, clearCurrentRoom, updateRoomLocally } = roomsSlice.actions;

export const selectHostedRooms = (state) => state.rooms.hostedRooms;
export const selectJoinedRooms = (state) => state.rooms.joinedRooms;
export const selectCurrentRoom = (state) => state.rooms.currentRoom;
export const selectRoomsLoading = (state) => state.rooms.loading;

export default roomsSlice.reducer;