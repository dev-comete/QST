import type { vaguePayload, vagueType } from "../types/vagueType";
import apiClient from "./apiClient";

export const VagueService = {

	create: async ( data : vaguePayload) => {
		const url = import.meta.env.VITE_CREATE_VAGUE
		const response = await apiClient.post(url, data);
		return response.data;
	},

	getAllVague: async () => {
		const url = import.meta.env.VITE_LIST_VAGUE
		const response = await apiClient.get(url);
		return response.data as vagueType[];
	}
}