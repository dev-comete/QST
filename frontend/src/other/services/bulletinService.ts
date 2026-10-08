import type { BulletinGlobal, BulletinVague } from "../types/bulletinType";
import apiClient from "./apiClient";
import { ENDPOINTS } from "./endpoint";

const MY_VAGUE_URL = ENDPOINTS.BULLETIN.MY_VAGUES
const MY_BULLETIN_URL = ENDPOINTS.BULLETIN.MY_BULLETIN

export const BulletinService = {

	list : async () => {
		const response = await apiClient.get(MY_VAGUE_URL);
		return response.data as BulletinVague[];
	},

	evalList: async (vagueId: string) => {
		const response = await apiClient.get(MY_BULLETIN_URL + vagueId);
		return response.data as BulletinGlobal;
	}, 
	exportPdf: async (vagueId: string | number) => {
        const response = await apiClient.get(`quizzes/bulletin/vague/${vagueId}/pdf/`, {
            responseType: 'blob', 
        });
        return response.data;
	}
}