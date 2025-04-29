import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import jwt_decode from 'jwt-decode';
import { toast } from 'react-toastify';
import authService from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        
        if (token) {
          // Check if token is expired
          const decodedToken = jwt_decode(token);
          const currentTime = Date.now() / 1000;
          
          if (decodedToken.exp < currentTime) {
            // Token expired
            logout();
            return;
          }
          
          // Token is valid, get user info
          const response = await authService.getCurrentUser();
          setUser(response.data);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        logout();
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      setLoading(true);
      const response = await authService.login(email, password);
      const { token, user } = response.data;
      
      // Save token to localStorage
      localStorage.setItem('token', token);
      
      // Update state
      setUser(user);
      setIsAuthenticated(true);
      
      // Show success message
      toast.success('Giriş başarılı!');
      
      // Navigate to dashboard
      navigate('/');
      
      return user;
    } catch (error) {
      console.error('Login error:', error);
      
      // Show error message
      let errorMessage = 'Giriş yapılırken bir hata oluştu.';
      if (error.response) {
        errorMessage = error.response.data.error || errorMessage;
      }
      toast.error(errorMessage);
      
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    // Remove token from localStorage
    localStorage.removeItem('token');
    
    // Update state
    setUser(null);
    setIsAuthenticated(false);
    
    // Navigate to login page
    navigate('/login');
  };

  // Change password function
  const changePassword = async (currentPassword, newPassword) => {
    try {
      setLoading(true);
      await authService.changePassword(currentPassword, newPassword);
      
      // Show success message
      toast.success('Şifreniz başarıyla değiştirildi.');
      
      return true;
    } catch (error) {
      console.error('Change password error:', error);
      
      // Show error message
      let errorMessage = 'Şifre değiştirilirken bir hata oluştu.';
      if (error.response) {
        errorMessage = error.response.data.error || errorMessage;
      }
      toast.error(errorMessage);
      
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Update user profile
  const updateProfile = (updatedUser) => {
    setUser(prevUser => ({
      ...prevUser,
      ...updatedUser
    }));
  };

  // Context value
  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    changePassword,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;