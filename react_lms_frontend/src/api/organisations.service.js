import apiClient from './client'; // Ajustez le chemin selon votre structure

const ORG_URL = '/quizzes/crud/organisations/';

export const OrganisationService = {
  getAll: async () => {
    const response = await apiClient.get(ORG_URL);
    return response.data;
  },
  getById: async (id) => {
    const response = await apiClient.get(`${ORG_URL}${id}/`);
    return response.data;
  },
  create: async (data) => {
    const response = await apiClient.post(ORG_URL, data);
    return response.data;
  },
  update: async (id, data) => {
    const response = await apiClient.put(`${ORG_URL}${id}/`, data);
    return response.data;
  },
  delete: async (id) => {
    const response = await apiClient.delete(`${ORG_URL}${id}/`);
    return response.data;
  }
};