import type { quizAssignPayload, quizCreateType, quizType, studentQuizType } from "../types/quizType";
import apiClient from "./apiClient";

export const QuizService = {
	create : async ( data : quizCreateType) => {
		const url = import.meta.env.VITE_CRUD_QUIZ
		const response = await apiClient.post(url, data);
		return response.data;
	},

	list: async () => {
		const url = import.meta.env.VITE_CRUD_QUIZ
		const response = await apiClient.get(url);
		return response.data as quizType[];
	},

	assignQuestion: async(data : quizAssignPayload) => {
		const url = import.meta.env.VITE_ASSIGN_QUESTION_QUIZ
		const response = await apiClient.post(url, data);
		return response.data;
	},

	evalList: async () => {
		const url = import.meta.env.VITE_EVAL_QUIZ
		const response = await apiClient.get(url);
		return response.data as studentQuizType[];
	},

	startEval: async (id: string) => {
		const url = '/quizzes/'+ id + '/take/'
		const response = await apiClient.get(url);
		return response.data;
	},

	submitEval: async ( data : quizCreateType) => {
		const url = import.meta.env.VITE_EVAL_SUBMIT
		const response = await apiClient.post(url, data);
		return response.data;
	}
}