import apiClient from './client';

export const FormationService = {
  getFormations: async () => {
    // Appel vers votre route exacte
    const response = await apiClient.get('/quizzes/crud/formations/');
    return response.data;
  }
};