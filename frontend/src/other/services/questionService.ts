import type { questionType } from "../types/questionType";
import apiClient from "./apiClient";

export const QuestionService = {
	
	create : async ( data : questionType) => {
		const url = import.meta.env.VITE_CREATE_QUESTION
		const response = await apiClient.post(url, { data });
		return response.data;
	}
}
