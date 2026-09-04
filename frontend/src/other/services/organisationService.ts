import type { OrganisationPayload, organisationType } from "../types/userType";
import apiClient from "./apiClient";

const ORGANISATION_URL = import.meta.env.VITE_ORGANISATION

export const OrganisationService = {

	create: async ( data : OrganisationPayload) => {
		const response = await apiClient.post(ORGANISATION_URL, data);
		return response.data;
	},

	update: async (id: string, data : OrganisationPayload) => {
		const response = await apiClient.put(ORGANISATION_URL + id + '/', data);
		return response.data;
	},

	delete: async (id: number) => {
		const response = await apiClient.delete(ORGANISATION_URL + id + '/');
		return response.data;
	},

	list : async () => {
		const response = await apiClient.get(ORGANISATION_URL);
		return response.data as organisationType[];
	},

	info : async (id: string) => {
		const response = await apiClient.get(ORGANISATION_URL + id);
		return response.data as organisationType;
	},

}