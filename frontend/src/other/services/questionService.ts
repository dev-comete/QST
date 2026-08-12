import type { baremeType, questionIdType, questionType } from "../types/questionType";
import apiClient from "./apiClient";

export const QuestionService = {
	create : async ( data : questionType) => {
		const url = import.meta.env.VITE_CREATE_QUESTION
		const response = await apiClient.post(url, data);
		return response.data;
	},

	getTypeQuestion : async () => {
		const url = import.meta.env.VITE_TYPE_QUESTION
		const response = await apiClient.get(url);
		return response.data as questionIdType[];
	},

	getBareme : async () => {
		const url = import.meta.env.VITE_BAREME
		const response = await apiClient.get(url);
		return response.data as baremeType[];
	},
}
