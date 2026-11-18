import type { authData } from "../../types/common";
import apiClient from "../apiClient";
import { ENDPOINTS } from "../endpoint";

export const AuthService = {
	
	login: async ({username, password} : { username : string, password : string}) => {
		const url = ENDPOINTS.AUTH.LOGIN
		const response = await apiClient.post(url, { username, password });
		return response.data as authData;
	},

	googleLogin: async (token: string) => {
		const response = await apiClient.post('accounts/auth/google/', { token });
		return response.data;
	},

	getMyProfile: async () => {
		const response = await apiClient.get("accounts/profile/me/");
		return response.data;
	},

	//logout if necessary

};