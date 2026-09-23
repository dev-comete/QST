import type { formationType } from "../types/common";
import type { Formation, FormationPayload } from "../types/formationType";
import apiClient from "./apiClient";

const FORMATION_URL = import.meta.env.VITE_CRUD_FORMATION

export const FormationService = {

	create : async (data: FormationPayload) => {
		const response = await apiClient.post(FORMATION_URL, data);
		return response.data;
	},

	update: async (id: string, data : FormationPayload) => {
		const response = await apiClient.put(FORMATION_URL + id + '/', data);
		return response.data;
	},

	delete : async (id: string) => {
		const response = await apiClient.delete(FORMATION_URL + id + '/');
		return response.data;
	},

	list : async () => {
		const response = await apiClient.get(FORMATION_URL);
		return response.data as Formation[];
	},

	info : async (id: string) => {
		const response = await apiClient.get(FORMATION_URL + id);
		return response.data as formationType;
	},
}