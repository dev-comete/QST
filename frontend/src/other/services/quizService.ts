import type { QuestionQuiz, quizAssignPayload, quizCreateType, QuizReview, QuizSubmitPayload, quizType, studentQuizType } from "../types/quizType";
import apiClient from "./apiClient";
import { ENDPOINTS } from "./endpoint";

const QUIZ_CRUD_URL = ENDPOINTS.QUIZ.CRUD
const QUIZ_TRASH_URL = ENDPOINTS.QUIZ.TRASH
const QUIZ_QUESTION_URL = ENDPOINTS.QUIZ.ASSIGN_QUESTION
const QUIZ_EVAL_URL = ENDPOINTS.QUIZ.EVAL
const QUIZ_SUBMIT_URL = ENDPOINTS.QUIZ.SUBMIT

export const QuizService = {
	create : async ( data : quizCreateType) => {
		const response = await apiClient.post(QUIZ_CRUD_URL, data);
		return response.data;
	},

	list: async (listType: string) => {
		const url = listType == 'trash' ? QUIZ_TRASH_URL : QUIZ_CRUD_URL
		const response = await apiClient.get(url);
		return response.data as quizType[];
	},

	delete: async (id: number) => {
		const response = await apiClient.delete(QUIZ_CRUD_URL + id + '/');
		return response.data;
	},

	restore: async (id: number) => {
		const response = await apiClient.post(QUIZ_TRASH_URL + id + '/restaurer/');
		return response.data;
	},

	update: async (id: number, data : quizCreateType) => {
		const response = await apiClient.patch(QUIZ_CRUD_URL + id + '/', data);
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
		const response = await apiClient.post(QUIZ_QUESTION_URL, data);
		return response.data;
	},

	listQuestion: async(id : number) => {
		const url ="/quizzes/" + id + "/questions/"
		const response = await apiClient.get(url);
		return response.data as QuestionQuiz[];
	},

	evalList: async () => {
		const response = await apiClient.get(QUIZ_EVAL_URL);
		return response.data as studentQuizType[];
	},

	startQuiz: async (id: string, vagueId: string | number) => {
		const url = '/quizzes/' + id + '/take/'
		const response = await apiClient.get(url, {
			params: { vague_id: vagueId }
		});
		return response.data;
	},

	submitQuiz: async ( data : QuizSubmitPayload) => {
		const response = await apiClient.post(QUIZ_SUBMIT_URL, data);
		return response.data;
	},

	reviewQuiz: async (quizId: string, vagueId: string | number) => {
		const response = await apiClient.get(`quizzes/${quizId}/review/`, {
			params: { vague_id: vagueId }
		});
		return response.data as QuizReview;
	},
}