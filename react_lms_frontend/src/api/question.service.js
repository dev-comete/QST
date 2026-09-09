import apiClient from './client';

export const QuestionService = {
  getBankQuestions: async (searchTerm = '', typeCode = '', page = 1, excludeQuizId = null) => {
  const response = await apiClient.get('quizzes/banque-questions/', {
    params: {
      search: searchTerm,
      type: typeCode,
      page: page,
      exclude_quiz: excludeQuizId,
    }
  });
  return response.data;
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
  getQuestionById: async (id) => {
    const response = await apiClient.get(`quizzes/banque-questions/${id}/`);
    return response.data;
  },
  updateQuestion: async (id, payload) => {
    const response = await apiClient.put(`quizzes/banque-questions/${id}/`, payload);
    return response.data;
  },
  deleteQuestion: async (id) => {
    const response = await apiClient.delete(`quizzes/banque-questions/${id}/`);
    return response.data;
  },
};