import apiClient from './client';

export const QuizService = {
  // Récupérer la liste des quiz
  getQuizzes: async () => {
    // Ajustez l'URL selon la configuration exacte de votre urls.py dans Django
    const response = await apiClient.get('/quizzes/crud/quizzes/'); 
    return response.data;
  },
  
  // (Préparation pour la suite) Créer un nouveau quiz
  createQuiz: async (quizData) => {
    const response = await apiClient.post('/quizzes/crud/quizzes/', quizData);
    return response.data;
  }
};