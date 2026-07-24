import apiClient from './client';

// API Layer: Only handles network requests for Authentication
export const AuthService = {
  login: async (username, password) => {
    const response = await apiClient.post('accounts/auth/login/', { username, password });
    return response.data; // { access, refresh, user }
  }
};
