import type { Formation, FormationPayload } from "../types/formationType";
import apiClient from "./apiClient";

const FORMATION_URL = import.meta.env.VITE_CRUD_FORMATION

export const FormationService = {

	create : async (data: FormationPayload) => {
		const response = await apiClient.post(FORMATION_URL, data);
		return response.data;
	},

	list : async () => {
		const response = await apiClient.get(FORMATION_URL);
		return response.data as Formation[];
	}
}