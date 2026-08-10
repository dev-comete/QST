import type { userData } from "../types/common";
import apiClient from "./apiClient";

export const AuthService = {
	
	login: async ({username, password} : { username : string, password : string}) => {
		const url = import.meta.env.VITE_AUTH
		const response = await apiClient.post(url, { username, password });
		return response.data as userData;
	},

	//logout

};