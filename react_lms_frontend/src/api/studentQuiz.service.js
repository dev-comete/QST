import apiClient from './client';

export const StudentQuizService = {
  // Récupère TOUS les quiz assignés à l'étudiant (à faire et terminés)
  getMyQuizzes: async () => {
    // Remplacez par l'URL exacte de votre ApprenantQuizListAPIView
    const response = await apiClient.get('/quizzes/mes-quiz/');
    return response.data;
  },

  // Démarre le quiz et récupère les questions
  startQuiz: async (quizId) => {
    // Remplacez par l'URL exacte de votre TakeQuizAPIView
    const response = await apiClient.get(`quizzes/${quizId}/take/`);
    return response.data;
  },

  // Soumet les réponses
  submitQuiz: async (quizId, answers) => {
    // Remplacez par l'URL exacte de votre SubmitQuizAPIView
    const response = await apiClient.post('quizzes/student-submit/', {
      quiz_id: quizId,
      answers: answers
    });
    return response.data;
  },

  // (Optionnel) Voir la correction plus tard
  reviewQuiz: async (quizId) => {
    const response = await apiClient.get(`quizzes/${quizId}/review/`);
    return response.data;
  },
  getBulletin: async (vagueId) => {
    // Ajustez l'URL selon votre urls.py
    const response = await apiClient.get(`quizzes/bulletin/vague/${vagueId}/`);
    return response.data;
  }
};