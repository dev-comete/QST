import type { quizAssignPayload, quizCreateType, QuizReview, QuizSubmitPayload, quizType, studentQuizType } from "../types/quizType";
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

	startQuiz: async (id: string) => {
		const url = '/quizzes/'+ id + '/take/'
		const response = await apiClient.get(url);
		return response.data;
	},

	submitQuiz: async ( data : QuizSubmitPayload) => {
		const url = import.meta.env.VITE_EVAL_SUBMIT
		const response = await apiClient.post(url, data);
		return response.data;
	},

	reviewQuiz: async (quizId: string) => {
		const response = await apiClient.get(`quizzes/${quizId}/review/`);
		return response.data as QuizReview;
	},
}