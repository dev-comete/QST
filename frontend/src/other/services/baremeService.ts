import type { baremeType } from "../types/questionType";
import apiClient from "./apiClient";

const BAREME_URL = import.meta.env.VITE_BAREME

export const BaremeService = {

	create: async ( data : { pts: number}) => {
		const response = await apiClient.post(BAREME_URL, data);
		return response.data;
	},

	delete: async (id: number) => {
		const response = await apiClient.delete(BAREME_URL + id + '/');
		return response.data;
	},

	list : async () => {
		const response = await apiClient.get(BAREME_URL);
		return response.data as baremeType[];
	},

}