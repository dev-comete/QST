import type { quizAssignPayload, quizCreateType, QuizReview, QuizSubmitPayload, quizType, studentQuizType } from "../types/quizType";
import apiClient from "./apiClient";

const QUIZ_CRUD_URL = import.meta.env.VITE_CRUD_QUIZ


export const QuizService = {
	create : async ( data : quizCreateType) => {
		const response = await apiClient.post(QUIZ_CRUD_URL, data);
		return response.data;
	},

	list: async () => {
		const response = await apiClient.get(QUIZ_CRUD_URL);
		return response.data as quizType[];
	},

	delete: async (id: number) => {
		const response = await apiClient.delete(QUIZ_CRUD_URL + id + '/');
		return response.data;
	},

	info: async (id: number) => {
		const response = await apiClient.get(QUIZ_CRUD_URL + id + '/');
		return response.data as quizType;
	},

	updateStatus: async (id: number, status: string) => {
		const response = await apiClient.patch(QUIZ_CRUD_URL + id + '/', {status});
		return response.data;
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