import type { ProjectPayload, projectType } from "../types/userType";
import apiClient from "./apiClient";

const PROJECT_URL = import.meta.env.VITE_PROJECT

export const ProjectService = {

	create: async ( data : ProjectPayload) => {
		const response = await apiClient.post(PROJECT_URL, data);
		return response.data;
	},

	update: async (id: string, data : ProjectPayload) => {
		const response = await apiClient.put(PROJECT_URL + id + '/', data);
		return response.data;
	},

	delete: async (id: number) => {
		const response = await apiClient.delete(PROJECT_URL + id + '/');
		return response.data;
	},

	list : async () => {
		const response = await apiClient.get(PROJECT_URL);
		return response.data as projectType[];
	},

	info : async (id: string) => {
		const response = await apiClient.get(PROJECT_URL + id);
		return response.data as projectType;
	},

}