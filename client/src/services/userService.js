import api from './api';

// User related API calls
const userService = {
  // Get all users
  getUsers: () => {
    return api.get('/users');
  },
  
  // Get single user by ID
  getUser: (id) => {
    return api.get(`/users/${id}`);
  },
  
  // Create new user
  createUser: (userData) => {
    return api.post('/users', userData);
  },
  
  // Update user
  updateUser: (id, userData) => {
    return api.put(`/users/${id}`, userData);
  },
  
  // Reset user password (admin only)
  resetPassword: (id, newPassword) => {
    return api.post(`/users/${id}/reset-password`, { newPassword });
  },
  
  // Delete user
  deleteUser: (id) => {
    return api.delete(`/users/${id}`);
  }
};

export default userService;