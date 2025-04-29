import api from './api';

// Auth related API calls
const authService = {
  // Login user
  login: (email, password) => {
    return api.post('/auth/login', { email, password });
  },
  
  // Get current user data
  getCurrentUser: () => {
    return api.get('/auth/me');
  },
  
  // Change password
  changePassword: (currentPassword, newPassword) => {
    return api.post('/auth/change-password', { 
      currentPassword, 
      newPassword 
    });
  }
};

export default authService;