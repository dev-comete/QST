import axios from 'axios';
import { TokenStorage } from '../utils/storage';

// Centralized Axios instance configuration
const apiClient = axios.create({
  baseURL: 'http://localhost:8000/', // Adjust to match your Django server URL
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach the JWT token to every request automatically
apiClient.interceptors.request.use(
  (config) => {
    const token = TokenStorage.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default apiClient;
