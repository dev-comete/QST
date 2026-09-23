import type { PaginatedData } from "../types/common";
import type { bankQuestionType, questionIdType, questionType } from "../types/questionType";
import apiClient from "./apiClient";

const QUESTION_URL = import.meta.env.VITE_CRUD_QUESTION
const BANK_QUESTION_URL = import.meta.env.VITE_BANK_QUESTION
const TRASH_QUESTION_URL = import.meta.env.VITE_TRASH_QUESTION

export interface BankQuestionParams {
	search?: string;
	type?: string;
	page?: number;
	listType?: string
}

export const QuestionService = {
	create : async ( data : questionType) => {
		const url = import.meta.env.VITE_CREATE_QUESTION
		const response = await apiClient.post(url, data);
		return response.data;
	},

	edit : async ( data : questionType) => {
		const url = import.meta.env.VITE_CREATE_QUESTION
		const response = await apiClient.put(url, data);
		return response.data;
	},

	getTypeQuestion : async () => {
		const url = import.meta.env.VITE_TYPE_QUESTION
		const response = await apiClient.get(url);
		return response.data as questionIdType[];
	},

	list: async ({ search, type, page, listType }: BankQuestionParams) => {
		
		const queryParams = new URLSearchParams({
			search: search ?? '',
			type: type ?? '',
			page: page ? page.toString() : '1',
		}).toString();
		
		const url = listType == 'bank' ? BANK_QUESTION_URL : TRASH_QUESTION_URL

		const response = await apiClient.get<PaginatedData<bankQuestionType>>(`${url}?${queryParams}`);
		return response.data;
	},

	info: async (id: string) => {
		const response = await apiClient.get(QUESTION_URL + id + '/');
		const result = response.data as bankQuestionType
		return result;
	},

	detail: async (id: string) => {
		const url = import.meta.env.VITE_CREATE_QUESTION
		const response = await apiClient.get(url + id + '/');
		const result = response.data as bankQuestionType
		return result;
	},

	delete: async (id: number) => {
		const response = await apiClient.delete(QUESTION_URL + id + '/');
		const result = response.data
		return result;
	},

	restore: async (id: number) => {
		const response = await apiClient.post(TRASH_QUESTION_URL + id + '/restaurer/');
		const result = response.data
		return result;
	},
}
