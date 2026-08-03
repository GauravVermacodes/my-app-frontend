// src/store/api/apiSlice.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Videos', 'Rooms', 'Notifications', 'Friends', 'User', 'Playlists', 'Series'],
  endpoints: (builder) => ({
    // ═══════════════════════════════════════════════════════════
    //  VIDEOS
    // ═══════════════════════════════════════════════════════════
    getVideos: builder.query({
      query: (params = {}) => ({
        url: '/videos',
        params: { limit: 100, ...params },
      }),
      providesTags: ['Videos'],
      keepUnusedDataFor: 60, // Cache for 60 seconds
    }),

    getVideo: builder.query({
      query: (id) => `/videos/${id}`,
      providesTags: (result, error, id) => [{ type: 'Videos', id }],
    }),

    uploadVideo: builder.mutation({
      query: (formData) => ({
        url: '/videos/upload',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['Videos'],
    }),

    // ═══════════════════════════════════════════════════════════
    //  ROOMS
    // ═══════════════════════════════════════════════════════════
    getMyRooms: builder.query({
      query: () => '/rooms/my-rooms',
      providesTags: ['Rooms'],
      keepUnusedDataFor: 30,
    }),

    getRoom: builder.query({
      query: (roomId) => `/rooms/${roomId}`,
      providesTags: (result, error, id) => [{ type: 'Rooms', id }],
    }),

    createRoom: builder.mutation({
      query: (data) => ({
        url: '/rooms/create',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Rooms'],
    }),

    deleteRoom: builder.mutation({
      query: (roomId) => ({
        url: `/rooms/${roomId}/delete`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Rooms'],
    }),

    restartSession: builder.mutation({
      query: ({ roomId, ...data }) => ({
        url: `/rooms/${roomId}/restart-session`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Rooms'],
    }),

    // ═══════════════════════════════════════════════════════════
    //  NOTIFICATIONS
    // ═══════════════════════════════════════════════════════════
    getNotifications: builder.query({
      query: (params) => ({
        url: '/notifications',
        params,
      }),
      providesTags: ['Notifications'],
    }),

    getUnreadCount: builder.query({
      query: () => '/notifications/unread-count',
      providesTags: ['Notifications'],
    }),

    markAsRead: builder.mutation({
      query: (id) => ({
        url: `/notifications/${id}/read`,
        method: 'PUT',
      }),
      invalidatesTags: ['Notifications'],
    }),

    // ═══════════════════════════════════════════════════════════
    //  FRIENDS
    // ═══════════════════════════════════════════════════════════
    getFriends: builder.query({
      query: () => '/auth/friends',
      providesTags: ['Friends'],
    }),

    getPendingRequests: builder.query({
      query: () => '/friends/requests/pending',
      providesTags: ['Friends'],
    }),

    sendFriendRequest: builder.mutation({
      query: (recipientId) => ({
        url: '/friends/request',
        method: 'POST',
        body: { recipientId },
      }),
      invalidatesTags: ['Friends'],
    }),

    // ═══════════════════════════════════════════════════════════
    //  USER
    // ═══════════════════════════════════════════════════════════
    getProfile: builder.query({
      query: () => '/auth/profile',
      providesTags: ['User'],
    }),

    updateProfile: builder.mutation({
      query: (data) => ({
        url: '/auth/profile',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),
  }),
});

export const {
  // Videos
  useGetVideosQuery,
  useGetVideoQuery,
  useUploadVideoMutation,
  
  // Rooms
  useGetMyRoomsQuery,
  useGetRoomQuery,
  useCreateRoomMutation,
  useDeleteRoomMutation,
  useRestartSessionMutation,
  
  // Notifications
  useGetNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkAsReadMutation,
  
  // Friends
  useGetFriendsQuery,
  useGetPendingRequestsQuery,
  useSendFriendRequestMutation,
  
  // User
  useGetProfileQuery,
  useUpdateProfileMutation,
} = apiSlice;