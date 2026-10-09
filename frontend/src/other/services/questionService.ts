import type { PaginatedData } from "../types/common";
import type { bankQuestionType, questionIdType, questionType, QuestionTypePayload } from "../types/questionType";
import apiClient from "./apiClient";
import { ENDPOINTS } from "./endpoint";

const QUESTION_URL = ENDPOINTS.QUESTION.CRUD
const QUESTION_FULL_CREATE_URL = ENDPOINTS.QUESTION.CREATE
const BANK_QUESTION_URL = ENDPOINTS.QUESTION.BANK
const TRASH_QUESTION_URL = ENDPOINTS.QUESTION.TRASH
const TYPE_QUESTION_URL = ENDPOINTS.QUESTION.TYPES

export interface BankQuestionParams {
	search?: string;
	type?: string;
	page?: number;
	pageSize?:number;
	listType?: string
}

export const QuestionService = {
	create : async ( data : questionType) => {
		const response = await apiClient.post(QUESTION_FULL_CREATE_URL, data);
		return response.data;
	},

	// Not operationnal yet
	edit : async ( data : questionType) => {
		const response = await apiClient.put(QUESTION_FULL_CREATE_URL, data);
		return response.data;
	},

	getTypeQuestion : async () => {
		const response = await apiClient.get(TYPE_QUESTION_URL);
		return response.data as questionIdType[];
	},

	infoTypeQuestion : async (id: number) => {
		const response = await apiClient.get(TYPE_QUESTION_URL + id);
		return response.data as questionIdType;
	},

	createTypeQuestion: async ( data : QuestionTypePayload) => {
		const response = await apiClient.post(TYPE_QUESTION_URL, data);
		return response.data;
	},

	editTypeQuestion: async ( id: number, data : QuestionTypePayload) => {
		const url = TYPE_QUESTION_URL + id
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
		const response = await apiClient.get<bankQuestionType>(BANK_QUESTION_URL + id);
		return response.data;
	},

	detail: async (id: string) => {
		const response = await apiClient.get(QUESTION_FULL_CREATE_URL + id + '/');
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
