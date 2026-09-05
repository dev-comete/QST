import type { bankQuestionType, questionIdType, questionType } from "../types/questionType";
import apiClient from "./apiClient";

const QUESTION_URL = import.meta.env.VITE_CRUD_QUESTION

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

	list: async () => {
		const url = import.meta.env.VITE_BANK_QUESTION
		const response = await apiClient.get(url);
		const result = response.data.results as bankQuestionType[]
		return result;
	},

	info: async (id: string) => {
		const response = await apiClient.get(QUESTION_URL + id + '/');
		const result = response.data as bankQuestionType
		return result;
	},

	delete: async (id: number) => {
		const response = await apiClient.delete(QUESTION_URL + id + '/');
		const result = response.data
		return result;
	},
}
