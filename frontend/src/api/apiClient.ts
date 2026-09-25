import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach token to request
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('obe_auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling 401s (commented out for offline exploration)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    /*
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('obe_auth_token');
      localStorage.removeItem('obe_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    */
    return Promise.reject(error);
  }
);
