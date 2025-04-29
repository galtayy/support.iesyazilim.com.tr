import axios from 'axios';
import { toast } from 'react-toastify';

// Create axios instance with base URL
const api = axios.create({
  baseURL: process.env.NODE_ENV === 'production' 
    ? 'https://api.support.iesyazilim.com.tr/api'
    : '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add a request interceptor for auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle global error responses
    if (error.response) {
      // Authentication errors
      if (error.response.status === 401) {
        localStorage.removeItem('token');
        if (window.location.pathname !== '/login') {
          toast.error('Oturum süreniz doldu. Lütfen tekrar giriş yapın.');
          window.location.href = '/login';
        }
      }
      
      // General server errors
      if (error.response.status >= 500) {
        toast.error('Sunucu hatası. Lütfen daha sonra tekrar deneyin.');
      }
    } else if (error.request) {
      // The request was made but no response was received
      toast.error('Sunucuya ulaşılamıyor. Lütfen internet bağlantınızı kontrol edin.');
    } else {
      // Something happened in setting up the request that triggered an Error
      toast.error('Bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
    }
    
    return Promise.reject(error);
  }
);

export default api;