/* eslint-disable no-constant-binary-expression */
import axios from 'axios';
import { TokenStorage } from './storage';

const apiClient = axios.create({
	baseURL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/' || 'https://8000-cs-629375525277-default.cs-asia-southeast1-palm.cloudshell.dev/',
	headers: {
	'Content-Type': 'application/json',
	},
});

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
