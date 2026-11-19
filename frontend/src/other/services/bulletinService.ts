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

	evalList: async (vagueId: string, studentId?: string | null) => {
		const response = await apiClient.get(MY_BULLETIN_URL + vagueId, {
			params: studentId ? { student_id: studentId } : undefined,
		});
		return response.data as BulletinGlobal;
	}, 
	exportPdf: async (vagueId: string | number, studentId?: string | null) => {
        const response = await apiClient.get(`quizzes/bulletin/vague/${vagueId}/pdf/`, {
            responseType: 'blob', 
			params: studentId ? { student_id: studentId } : undefined,
        });
        return response.data;
	}
}