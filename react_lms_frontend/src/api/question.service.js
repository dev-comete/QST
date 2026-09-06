import apiClient from './client';

export const QuestionService = {
  getBankQuestions: async (searchTerm = '', typeCode = '', page = 1) => {
    const response = await apiClient.get('quizzes/banque-questions/', {
      params: { search: searchTerm, type: typeCode, page: page }
    });
    return response.data; // Retourne { count, next, previous, results }
  },
  createFullQuestion: async (payload) => {
    const response = await apiClient.post('/quizzes/questions/create-full/', payload);
    return response.data;
  },
  getTrashQuestions: async (search = '', type = '', page = 1) => {
    // Si votre backend supporte la recherche/pagination sur la corbeille
    const response = await apiClient.get('quizzes/corbeille/questions/', {
      params: { search, type, page }
    });
    return response.data;
  },
  restoreQuestion: async (questionId) => {
    const response = await apiClient.post(`quizzes/corbeille/questions/${questionId}/restaurer/`);
    return response.data;
  },
};