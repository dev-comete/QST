import type { formationType } from "../types/common";
import apiClient from "./apiClient";

export const FormationService = {
	list : async () => {
		const url = import.meta.env.VITE_CRUD_FORMATION
		const response = await apiClient.get(url);
		return response.data as formationType[];
	}
}