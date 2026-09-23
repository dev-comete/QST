// src/services/VagueService.js
import apiClient from './client';

export const VagueService = {
  // Récupérer toutes les vagues (avec leurs étudiants grâce à VagueListWithStudentsSerializer)
  getAll: async (filters = {}) => {
    const response = await apiClient.get('/formation/vagues/', { params: filters });
    return response.data;
  },

  // Créer une nouvelle vague (CreateVagueAPIView)
  create: async (nom_vague, formationId, debut, fin) => {
    const response = await apiClient.post('/formation/vagues/create/', {
      nom_vague: nom_vague,
      formation_id: formationId,
      debut: debut,
      fin: fin
    });
    return response.data;
  },
  updateVague: async (vagueId, payload) => {
    const response = await apiClient.patch(`/quizzes/crud/vagues/${vagueId}/`, payload);
    return response.data;
  },

  assignStudents: async (vagueId, studentIdsArray) => {
    const response = await apiClient.post('/formation/vagues/assign-student/', {
      vague_id: vagueId,
      etudiant_ids: studentIdsArray
    });
    return response.data;
  },

  // Assigner un quiz à toute la vague (AssignQuizToVagueAPIView)
  assignQuiz: async (vagueId, quizId) => {
    const response = await apiClient.post('/formation/vagues/assign-quiz/', {
      vague_id: vagueId,
      quiz_id: quizId
    });
    return response.data;
  },

  getAnalytics: async (vagueId) => {
      // Ajustez l'URL selon votre urls.py
      const response = await apiClient.get(`/quizzes/analytics/vague/${vagueId}/`);
      return response.data;
    },

  getById: async (id) => {
    const response = await apiClient.get(`quizzes/crud/vagues/${id}/`);
    return response.data;
  },

  update: async (id, formation_id, debut, fin) => {
    const response = await apiClient.put(`/quizzes/crud/vagues/${id}/`, {
      formation: formation_id,
      debut: debut,
      fin: fin
    });
    return response.data;
  },
  };