import apiClient from './client';

const FORMATION_URL = '/quizzes/crud/formations/'; 

export const FormationService = {
  getAll: async () => {
    const response = await apiClient.get(FORMATION_URL);
    return response.data;
  },
  getById: async (id) => {
    const response = await apiClient.get(`${FORMATION_URL}${id}/`);
    return response.data;
  },
  create: async (data) => {
    const response = await apiClient.post(FORMATION_URL, data);
    return response.data;
  },
  update: async (id, data) => {
    const response = await apiClient.put(`${FORMATION_URL}${id}/`, data);
    return response.data;
  },
  delete: async (id) => {
    const response = await apiClient.delete(`${FORMATION_URL}${id}/`);
    return response.data;
  }
};