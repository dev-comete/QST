import type { PaginatedData } from "../types/common";
import type { bankQuestionType, questionIdType, questionType, QuestionTypePayload } from "../types/questionType";
import apiClient from "./apiClient";

const QUESTION_URL = import.meta.env.VITE_CRUD_QUESTION
const BANK_QUESTION_URL = import.meta.env.VITE_BANK_QUESTION
const TRASH_QUESTION_URL = import.meta.env.VITE_TRASH_QUESTION

export interface BankQuestionParams {
	search?: string;
	type?: string;
	page?: number;
	pageSize?:number;
	listType?: string
}

export const QuestionService = {
	create : async ( data : questionType) => {
		const url = import.meta.env.VITE_CREATE_QUESTION
		const response = await apiClient.post(url, data);
		return response.data;
	},

	// Not operationnal yet
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

	infoTypeQuestion : async (id: number) => {
		const url = import.meta.env.VITE_TYPE_QUESTION + id
		const response = await apiClient.get(url);
		return response.data as questionIdType;
	},

	createTypeQuestion: async ( data : QuestionTypePayload) => {
		const url = import.meta.env.VITE_TYPE_QUESTION
		const response = await apiClient.post(url, data);
		return response.data;
	},

	editTypeQuestion: async ( id: number, data : QuestionTypePayload) => {
		const url = import.meta.env.VITE_TYPE_QUESTION + id
		const response = await apiClient.put(url, data);
		return response.data;
	},

	list: async ({ search, type, page, pageSize, listType }: BankQuestionParams) => {
		
		const queryParams = new URLSearchParams({
			search: search ?? '',
			type: type ?? '',
			page: page ? page.toString() : '1',
			page_size: pageSize? pageSize.toString() : '3',
		}).toString();
		
		const rawUrl = listType == 'bank' ? BANK_QUESTION_URL : TRASH_QUESTION_URL
		const response = await apiClient.get<PaginatedData<bankQuestionType>>(rawUrl + '?' + queryParams);
		return response.data;
	},

	info: async (id: string) => {
		const response = await apiClient.get(BANK_QUESTION_URL + id + '/');
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
