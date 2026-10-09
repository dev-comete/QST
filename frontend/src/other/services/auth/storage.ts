import axios from "axios";
import apiClient from "../apiClient";
import type { User } from "../../types/common";

export const TokenStorage = {
	getAccessToken: () => localStorage.getItem('access_token'),
	getRefreshToken: () => localStorage.getItem('refresh_token'),
	getUser: () => JSON.parse(localStorage.getItem('user') || 'null'),

	setAuthData: (access : string, refresh : string, user : User) => {
		localStorage.setItem('access_token', access);
		localStorage.setItem('refresh_token', refresh);
		localStorage.setItem('user', JSON.stringify(user));
	},

	clear: () => {
		localStorage.removeItem('access_token');
		localStorage.removeItem('refresh_token');
		localStorage.removeItem('user');
	}
};

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
			TokenStorage.clear();
			
			// Redirection forcée vers le login (adaptez l'URL selon votre routeur)
			window.location.href = '/login'; 
			return Promise.reject(refreshError);
		}
	}

	if (error.response && error.response.status === 403) {
		// Avoid forcing a full reload on 403 which can create a reload loop
		// (e.g. when an endpoint returns 403 repeatedly while the page reinitializes
		// and re-requests). Clear auth and redirect to a dedicated unauthorized page
		// so the app can render a proper message instead of reloading indefinitely.
		TokenStorage.clear();
		window.location.href = '/unauthorized';
		return Promise.reject(error);
	}

		return Promise.reject(error);
	}
);
