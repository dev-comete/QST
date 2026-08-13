import type { formationType } from "../types/common";
import type { quizCreateType, quizType } from "../types/quizType";
import apiClient from "./apiClient";

export const QuizService = {
	create : async ( data : quizCreateType) => {
		const url = import.meta.env.VITE_CRUD_QUIZ
		alert(JSON.stringify(data))
		const response = await apiClient.post(url, data);
		return response.data;
	},

	getFormation : async () => {
		const url = import.meta.env.VITE_CRUD_FORMATION
		const response = await apiClient.get(url);
		return response.data as formationType[];
	},

	getAllQuiz: async () => {
		const url = import.meta.env.VITE_CRUD_QUIZ
		const response = await apiClient.get(url);
		return response.data as quizType[];
	},
}