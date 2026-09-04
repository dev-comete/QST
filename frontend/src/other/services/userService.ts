import { USERNAME_MIN } from "../types/constant";
import type { organisationType, userPayload, userType, utilisateurType } from "../types/userType";
import apiClient from "./apiClient";

const USER_URL = import.meta.env.VITE_CRUD_USER

const userValidationPayload = (data: userPayload) => {
	if (!data.username || data.username.trim().length < USERNAME_MIN) {
		throw new Error("Le nom d'utilisateur doit contenir au moins 8 caractères.", { cause: "user" });
	}

	if (!data.email || !data.email.includes("@")) {
		throw new Error("L'adresse email est invalide.", { cause: "email" });
	}
}

export const UserService = {

	create: async (data: userPayload) => {
		userValidationPayload(data)
		const response = await apiClient.post(USER_URL, data);
		return response.data;
	},

	update: async (id : string, data: userPayload) => {
		userValidationPayload(data)
		const response = await apiClient.put(`${USER_URL}${id}/`, data);
		return response.data;
	},

	delete: async (id: string ) => {
		const response = await apiClient.delete(`${USER_URL}${id}/`)
		return response.data;
	},

	list: async (params?: { role?: string }) => {
		const role = params?.role;

		const response = await apiClient.get<userType[]>(USER_URL, {
			params: role ? { role } : undefined
		});
		
		return response.data;
	},

	info: async (params?: { id: string }) => {
		const id = params?.id;
		const response = await apiClient.get<userPayload>(USER_URL + id);
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