import axios from 'axios';
import { TokenStorage } from '../utils/storage';

// Centralized Axios instance configuration
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/' || 'https://8000-cs-629375525277-default.cs-asia-southeast1-palm.cloudshell.dev/',
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
