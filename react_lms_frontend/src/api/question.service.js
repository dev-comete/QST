import apiClient from './client';

export const QuestionService = {
  getBankQuestions: async (searchTerm = '', typeCode = '', page = 1) => {
    const response = await apiClient.get('quizzes/banque-questions/', {
      params: { search: searchTerm, type: typeCode, page: page }
    });
    return response.data; // Retourne { count, next, previous, results }
  }
};