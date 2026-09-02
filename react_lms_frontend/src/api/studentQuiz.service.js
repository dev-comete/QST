import apiClient from './client';

export const StudentQuizService = {
  // Récupère TOUS les quiz assignés à l'étudiant (à faire et terminés)
  getMyQuizzes: async () => {
    // Remplacez par l'URL exacte de votre ApprenantQuizListAPIView
    const response = await apiClient.get('/quizzes/mes-quiz/');
    return response.data;
  },
  getMyVagues: async () => {
    const response = await apiClient.get('/formation/student/mes-vagues/');
    return response.data;
  },

  // Démarre le quiz et récupère les questions
  startQuiz: async (quizId, vagueId) => {
    const response = await apiClient.get(`quizzes/${quizId}/take/`, {
      params: { vague_id: vagueId } // Axios ajoute automatiquement le "?"
    });
    return response.data;
  },

  // Soumet les réponses
  submitQuiz: async (payload) => {
    /* Le payload reçu ressemble à :
      {
        "quiz_id": 5,
        "vague_id": 12,
        "answers": { "1": [2], "2": [5,6] }
      }
    */
    const response = await apiClient.post('quizzes/student-submit/', payload);
    return response.data;
  },

  // (Optionnel) Voir la correction plus tard
  reviewQuiz: async (quizId, vagueId) => {
    const response = await apiClient.get(`quizzes/${quizId}/review/`, {
      params: { vague_id: vagueId }
    });
    return response.data;
  },
  
  getBulletin: async (vagueId) => {
    // Ajustez l'URL selon votre urls.py
    const response = await apiClient.get(`quizzes/bulletin/vague/${vagueId}/`);
    return response.data;
  }
};