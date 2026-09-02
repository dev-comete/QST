import type { BulletinGlobal, BulletinVague } from "../types/bulletinType";
import apiClient from "./apiClient";

export const BulletinService = {

	list : async () => {
		const url = import.meta.env.VITE_MY_VAGUE_LIST
		const response = await apiClient.get(url);
		return response.data as BulletinVague[];
	},

	evalList: async (vagueId: string) => {
		const url = import.meta.env.VITE_MY_BULLETIN + vagueId
		const response = await apiClient.get(url);
		return response.data as BulletinGlobal;
	}

}