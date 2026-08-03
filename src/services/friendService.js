import api from './api';

export const friendService = {
  sendFriendRequest: async (recipientId) => {
    const response = await api.post('/friends/request', { recipientId });
    return response.data;
  },

  acceptFriendRequest: async (requestId) => {
    const response = await api.post(`/friends/request/${requestId}/accept`);
    return response.data;
  },

  declineFriendRequest: async (requestId) => {
    const response = await api.post(`/friends/request/${requestId}/decline`);
    return response.data;
  },

  getPendingRequests: async () => {
    const response = await api.get('/friends/requests/pending');
    return response.data;
  },

  getSentRequests: async () => {
    const response = await api.get('/friends/requests/sent');
    return response.data;
  },

  removeFriend: async (friendId) => {
    const response = await api.delete(`/friends/${friendId}`);
    return response.data;
  },
};

export default friendService;