import axios from 'axios';
import { TokenStorage } from '../utils/storage';

// Centralized Axios instance configuration
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/',
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

// INTERCEPTEUR DE RÉPONSE : Gère l'expiration et le rafraîchissement transparent
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Si erreur 401 (Non Autorisé) et qu'on n'a pas encore tenté le rafraîchissement
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // Sécurité anti-boucle infinie

      try {
        const refreshToken = TokenStorage.getRefreshToken();
        
        if (!refreshToken) {
            throw new Error("Aucun refresh token disponible");
        }

        // Appel direct via 'axios' pur pour ne pas déclencher nos propres intercepteurs
        const response = await axios.post(
          `${apiClient.defaults.baseURL}accounts/auth/refresh/`, 
          { refresh: refreshToken }
        );

        const newAccessToken = response.data.access;
        
        // Mise à jour du Storage (On garde le même refresh token et le même user)
        const currentUser = TokenStorage.getUser();
        TokenStorage.setAuthData(newAccessToken, refreshToken, currentUser);

        // On met à jour le header de la requête échouée et on la relance
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);

      } catch (refreshError) {
        // Le refresh token est lui-même expiré ou invalide
        console.error("Session expirée. Veuillez vous reconnecter.");
        TokenStorage.clear();
        
        // Redirection forcée vers le login (adaptez l'URL selon votre routeur)
        window.location.href = '/login'; 
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
