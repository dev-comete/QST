// src/services/UserService.js
import apiClient from './client';

// Adaptez l'URL si votre route Django est légèrement différente
const USER_URL = '/quizzes/crud/utilisateurs/'; 

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
  }
};