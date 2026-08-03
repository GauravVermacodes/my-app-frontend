// src/services/roomService.js
import api from './api';

export const roomService = {
  // ═══════════════════════════════════════════════════════════
  //  CREATE & JOIN
  // ═══════════════════════════════════════════════════════════
  createRoom: async (roomData) => {
    const response = await api.post('/rooms/create', roomData);
    return response.data;
  },

  getRoomInfo: async (roomCode) => {
    const response = await api.get(`/rooms/info/${roomCode}`);
    return response.data;
  },

  joinRoom: async (roomCode, { micOn = false, cameraOn = false } = {}) => {
    const response = await api.post(`/rooms/join/${roomCode}`, {
      micOn,
      cameraOn,
    });
    return response.data;
  },

  joinAsGuest: async (roomCode, { guestName, micOn = false, cameraOn = false }) => {
    const response = await api.post(`/rooms/join-guest/${roomCode}`, {
      guestName,
      micOn,
      cameraOn,
    });
    return response.data;
  },

  // ═══════════════════════════════════════════════════════════
  //  ROOM DATA
  // ═══════════════════════════════════════════════════════════
  getRoom: async (roomId) => {
    const response = await api.get(`/rooms/${roomId}`);
    return response.data;
  },

  getUserRooms: async () => {
    const response = await api.get('/rooms/my-rooms');
    return response.data;
  },

  // ═══════════════════════════════════════════════════════════
  //  INVITE FRIENDS
  // ═══════════════════════════════════════════════════════════
  inviteFriends: async (roomId, { friendIds = [], inviteAll = false } = {}) => {
    const response = await api.post(`/rooms/${roomId}/invite-friends`, {
      friendIds,
      inviteAll,
    });
    return response.data;
  },

  // ═══════════════════════════════════════════════════════════
  //  LEAVE / CLOSE / DELETE
  // ═══════════════════════════════════════════════════════════
  leaveRoom: async (roomId, isExplicitLeave = true) => {
    const response = await api.post(`/rooms/${roomId}/leave`, {
      isExplicitLeave,
    });
    return response.data;
  },

  closeRoom: async (roomId) => {
    const response = await api.post(`/rooms/${roomId}/close`);
    return response.data;
  },

  deleteRoom: async (roomId) => {
    const response = await api.delete(`/rooms/${roomId}/delete`);
    return response.data;
  },

  // ═══════════════════════════════════════════════════════════
  //  SESSION CONTROL
  // ═══════════════════════════════════════════════════════════
  endSession: async (roomId) => {
    const response = await api.post(`/rooms/${roomId}/end-session`);
    return response.data;
  },

  /**
   * ✅ UPDATED: Restart/Reschedule session
   * 
   * Supports two modes:
   * 
   * Mode 1: Duration-based (start now)
   *   restartSession(roomId, { scheduleMode: 'duration', duration: 60 })
   * 
   * Mode 2: Scheduled (specific date/time)
   *   restartSession(roomId, { 
   *     scheduleMode: 'scheduled',
   *     scheduledStart: '2025-01-15T10:00:00Z',
   *     scheduledEnd: '2025-01-15T11:00:00Z'
   *   })
   * 
   * Backward compatible: passing just a number still works
   *   restartSession(roomId, 60)  → { duration: 60 }
   */
  restartSession: async (roomId, options = {}) => {
    // Handle legacy call (just duration number)
    if (typeof options === 'number') {
      options = { duration: options };
    }

    const response = await api.post(
      `/rooms/${roomId}/restart-session`,
      options
    );
    return response.data;
  },

  extendDuration: async (roomId, extraMinutes) => {
    const response = await api.patch(`/rooms/${roomId}/extend`, {
      extraMinutes,
    });
    return response.data;
  },

  // ═══════════════════════════════════════════════════════════
  //  WAITING ROOM
  // ═══════════════════════════════════════════════════════════
  getWaitingParticipants: async (roomId) => {
    const response = await api.get(`/rooms/${roomId}/waiting`);
    return response.data;
  },

  approveParticipant: async (roomId, participantId) => {
    const response = await api.post(
      `/rooms/${roomId}/waiting/${participantId}/approve`
    );
    return response.data;
  },

  rejectParticipant: async (roomId, participantId) => {
    const response = await api.post(
      `/rooms/${roomId}/waiting/${participantId}/reject`
    );
    return response.data;
  },

  // ═══════════════════════════════════════════════════════════
  //  PARTICIPANT MANAGEMENT (Host)
  // ═══════════════════════════════════════════════════════════
  removeParticipant: async (roomId, participantId) => {
    const response = await api.post(
      `/rooms/${roomId}/participants/${participantId}/remove`
    );
    return response.data;
  },

  muteParticipant: async (roomId, participantId) => {
    const response = await api.post(
      `/rooms/${roomId}/participants/${participantId}/mute`
    );
    return response.data;
  },

  unmuteParticipant: async (roomId, participantId) => {
    const response = await api.post(
      `/rooms/${roomId}/participants/${participantId}/unmute`
    );
    return response.data;
  },

  toggleParticipantCamera: async (roomId, participantId, enabled) => {
    const response = await api.post(
      `/rooms/${roomId}/participants/${participantId}/toggle-camera`,
      { enabled }
    );
    return response.data;
  },

  toggleScreenSharePermission: async (roomId, participantId, allowed) => {
    const response = await api.post(
      `/rooms/${roomId}/participants/${participantId}/screen-share-permission`,
      { allowed }
    );
    return response.data;
  },
};

export default roomService;