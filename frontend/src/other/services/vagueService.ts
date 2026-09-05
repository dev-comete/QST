import type { assignQuizPayload, assignStudentPayload, vaguePayload, vagueType } from "../types/vagueType";
import apiClient from "./apiClient";

const VAGUE_URL = import.meta.env.VITE_CREATE_VAGUE

export const VagueService = {

	create: async ( data : vaguePayload) => {
		const response = await apiClient.post(VAGUE_URL, data);
		return response.data;
	},

	delete: async ( id: number) => {
		const response = await apiClient.delete(VAGUE_URL + id + '/' );
		return response.data;
	},

	getAllVague: async () => {
		const url = import.meta.env.VITE_LIST_VAGUE
		const response = await apiClient.get(url);
		return response.data as vagueType[];
	},

	assignStudent: async(data : assignStudentPayload) => {
		const url = import.meta.env.VITE_ASSIGN_STUDENT_VAGUE
		const response = await apiClient.post(url, data);
		return response.data;
	},

	assignQuiz: async(data : assignQuizPayload) => {
		const url = import.meta.env.VITE_ASSIGN_QUIZ_VAGUE
		const response = await apiClient.post(url, data);
		return response.data;
	}
}