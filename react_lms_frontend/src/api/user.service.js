// src/services/UserService.js
import apiClient from './client';

// Adaptez l'URL si votre route Django est légèrement différente
const USER_URL = '/quizzes/crud/utilisateurs/'; 
const ROLES_URL = '/quizzes/crud/types-utilisateurs/';
const ORGANISATIONS_URL = '/quizzes/crud/organisations/';

export const UserService = {
  // Récupère la liste complète (filtrée par le backend selon qui demande)
  getAll: async () => {
    const response = await apiClient.get(USER_URL);
    return response.data;
  },

  // 🌟 CRUCIAL : Récupère uniquement les apprenants de l'organisation
  getApprenants: async () => {
    // Le paramètre ?role=apprenant sera intercepté par le get_queryset de votre ViewSet
    const response = await apiClient.get(`${USER_URL}?role=apprenant`);
    return response.data;
  },

  getById: async (id) => {
    const response = await apiClient.get(`${USER_URL}${id}/`);
    return response.data;
  },
  create: async (data) => {
    const response = await apiClient.post(USER_URL, data);
    return response.data;
  },
  update: async (id, data) => {
    const response = await apiClient.put(`${USER_URL}${id}/`, data);
    return response.data;
  },
  delete: async (id) => {
    const response = await apiClient.delete(`${USER_URL}${id}/`);
    return response.data;
  },
  getRoles: async () => {
    const response = await apiClient.get(ROLES_URL);
    return response.data;
  },
  getOrganisations: async () => {
    const response = await apiClient.get(ORGANISATIONS_URL);
    return response.data;
  }
};