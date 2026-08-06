import apiClient from "./apiClient";

export const AuthService = {
	
	login: async (username : string, password : string) => {
		const url = import.meta.env.VITE_AUTH
		const response = await apiClient.post(url, { username, password });
		return response.data;
	},

	// En attente de backend pour url afin de checker si la session est OK
	// checkAuth : async () => {
	// 	const response = await fetch('/api/check-auth');
	// 		if (!response.ok) {
	// 		throw new Error('Not authenticated');
	// 	}
	// 	const data = await response.json();
	// 	return data.user
	// }

	//logout

};