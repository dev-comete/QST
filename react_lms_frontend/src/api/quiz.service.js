import apiClient from './client';

export const QuizService = {
  // Récupérer la liste des quiz
  getQuizzes: async () => {
    // Ajustez l'URL selon la configuration exacte de votre urls.py dans Django
    const response = await apiClient.get('/quizzes/crud/quizzes/'); 
    return response.data;
  },
  getQuizById: async (quizId) => {
    const response = await apiClient.get(`/quizzes/crud/quizzes/${quizId}/`);
    return response.data;
  },
  // (Préparation pour la suite) Créer un nouveau quiz
  createQuiz: async (quizData) => {
    const response = await apiClient.post('/quizzes/crud/quizzes/', quizData);
    return response.data;
  },
  updateStatus: async (quizId, newStatus) => {
    const response = await apiClient.patch(`/quizzes/crud/quizzes/${quizId}/`, { status: newStatus });
    return response.data;
  },
  updateQuiz: async (quizId, payload) => {
    const response = await apiClient.patch(`/quizzes/crud/quizzes/${quizId}/`, payload);
    return response.data;
  },
  getAssignedQuestions: async (quizId) => {
    const response = await apiClient.get(`/quizzes/${quizId}/questions/`);
    return response.data;},

  deleteQuiz: async (quizId) => {
    const response = await apiClient.delete(`/quizzes/crud/quizzes/${quizId}/`);
    return response.data;
  },
};