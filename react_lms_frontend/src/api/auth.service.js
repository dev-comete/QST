import apiClient from './client';
import { TokenStorage } from '../utils/storage';

export const AuthService = {
  login: async (username, password) => {
    const response = await apiClient.post('accounts/auth/login/', { username, password });
    return response.data; // { access, refresh, user }
  },

  logout: async () => {
    const refreshToken = TokenStorage.getRefreshToken();
    if (refreshToken) {
      try {
        await apiClient.post('accounts/auth/logout/', { refresh: refreshToken });
      } catch (error) {
        console.error("Erreur lors de la déconnexion backend", error);
      }
    }
  },
  confirmPasswordReset: async ({ uid, token, new_password }) => {
    const response = await apiClient.post('/accounts/auth/reset-password-confirm/', {
      uid,
      token,
      new_password
    });
    
    return response.data;
  }
};