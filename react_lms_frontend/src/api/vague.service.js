// src/services/VagueService.js
import apiClient from './client';

export const VagueService = {
  // Récupérer toutes les vagues (avec leurs étudiants grâce à VagueListWithStudentsSerializer)
  getAll: async () => {
    const response = await apiClient.get('/formation/vagues/');
    return response.data;
  },

  // Créer une nouvelle vague (CreateVagueAPIView)
  create: async (formationId, debut, fin) => {
    const response = await apiClient.post('/formation/vagues/create/', {
      formation_id: formationId,
      debut: debut,
      fin: fin
    });
    return response.data;
  },

  assignStudents: async (vagueId, studentIdsArray) => {
    // On envoie 'etudiant_ids' (avec un 's') contenant le tableau d'IDs
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
  };