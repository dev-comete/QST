import type { EvolutionChartResponse } from "../types/dashboardType";
import type { assignQuizPayload, assignStudentPayload, vagueInfo, vaguePayload, vagueStat, vagueType } from "../types/vagueType";
import apiClient from "./apiClient";
import { ENDPOINTS } from "./endpoint";

const VAGUE_CREATE_URL = ENDPOINTS.VAGUE.CREATE
const VAGUE_CRUD_URL = ENDPOINTS.VAGUE.CRUD
const VAGUE_LIST_URL = ENDPOINTS.VAGUE.LIST
const VAGUE_ASSIGN_STUD_URL = ENDPOINTS.VAGUE.ASSIGN_STUDENT
const VAGUE_ASSIGN_QUIZ_URL = ENDPOINTS.VAGUE.ASSIGN_QUIZ
const VAGUE_STAT_URL = ENDPOINTS.VAGUE.ANALYTICS
const VAGUE_CHART_URL = ENDPOINTS.VAGUE.CHART_EVOLUTION

export interface VagueListParam {
	formation?: string
	month?: string
	year?: string
}

export const VagueService = {

	create: async ( data : vaguePayload) => {
		const response = await apiClient.post(VAGUE_CREATE_URL, data);
		return response.data;
	},

	edit: async (id: number, data : vaguePayload) => {
		const response = await apiClient.patch(VAGUE_CRUD_URL + id + '/', data);
		return response.data;
	},

	delete: async ( id: number) => {
		const response = await apiClient.delete(VAGUE_CREATE_URL + id + '/' );
		return response.data;
	},

	list: async ({formation, month, year} : VagueListParam) => {
		const queryParams = new URLSearchParams({
			formation: formation ?? '',
			mois: month ?? '',
			annee: year ?? '',
		}).toString();

		const response = await apiClient.get(VAGUE_LIST_URL + '?' + queryParams);
		return response.data as vagueType[];
	},

	assignStudent: async(data : assignStudentPayload) => {
		const response = await apiClient.post(VAGUE_ASSIGN_STUD_URL, data);
		return response.data;
	},

	assignQuiz: async(data : assignQuizPayload) => {
		const response = await apiClient.post(VAGUE_ASSIGN_QUIZ_URL, data);
		return response.data;
	},

	statistic: async (id: string) => {
		const response = await apiClient.get(VAGUE_STAT_URL + id + '/');
		return response.data as vagueStat;
	},

	info: async (id: string) => {
		const response = await apiClient.get(VAGUE_CRUD_URL + id + '/');
		return response.data as vagueInfo;
	},

	evolutionChart: async (vagueId: number, studentIds: number[] = []) => {
		const queryParams = studentIds.length
			? `?etudiants=${studentIds.join(',')}`
			: ''

		const response = await apiClient.get(
			`${VAGUE_CHART_URL}${vagueId}/chart-evolution/${queryParams}`
		)
		return response.data as EvolutionChartResponse
	},

	exportPdf: async (vagueId: string | number) => {
        const response = await apiClient.get(`quizzes/bulletin/vague/${vagueId}/pdf/`, {
            responseType: 'blob', 
        });
        return response.data;
	}
}