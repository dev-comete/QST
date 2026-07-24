import apiClient from './client';

export const AssignmentService = {
  // Récupérer les types (via votre URL)
  getTypes: async () => {
    const response = await apiClient.get('/quizzes/crud/types-questions/');
    return response.data.results || response.data;
  },
  
  // Récupérer les barèmes
  getBaremes: async () => {
    const response = await apiClient.get('/quizzes/crud/baremes/');
    return response.data.results || response.data;
  },

  // Soumettre l'assignation
  assignQuestions: async (payload) => {
    const response = await apiClient.post('/quizzes/assign-questions/', payload);
    return response.data;
  }
};