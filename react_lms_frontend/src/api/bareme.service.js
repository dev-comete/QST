// src/services/BaremeService.js
import apiClient from './client';

const BAREME_URL = '/quizzes/crud/baremes/'; 

export const BaremeService = {
  getAll: async () => {
    const response = await apiClient.get(BAREME_URL);
    return response.data;
  },

  getById: async (id) => {
    const response = await apiClient.get(`${BAREME_URL}${id}/`);
    return response.data;
  },

  create: async (data) => {
    const response = await apiClient.post(BAREME_URL, data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await apiClient.put(`${BAREME_URL}${id}/`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await apiClient.delete(`${BAREME_URL}${id}/`);
    return response.data;
  }
};