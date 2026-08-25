import type { organisationType, userPayload, userType, utilisateurType } from "../types/userType";
import apiClient from "./apiClient";

export const UserService = {

	create: async (data: userPayload) => {
		const url = import.meta.env.VITE_CRUD_USER
		const response = await apiClient.post(url, data);
		return response.data;
	},

	list: async (params?: { role?: string }) => {
		const role = params?.role;
		const baseUrl = import.meta.env.VITE_CRUD_USER;
		
		const response = await apiClient.get<userType[]>(baseUrl, {
			params: role ? { role } : undefined
		});
		
		return response.data;
	},

	type :  async () => {
		const url = import.meta.env.VITE_TYPE_USER
		const response = await apiClient.get(url);
		return response.data as utilisateurType[];
	},

	organisationList :  async () => {
		const url = import.meta.env.VITE_ORGANISATION
		const response = await apiClient.get(url);
		return response.data as organisationType[];
	},

}