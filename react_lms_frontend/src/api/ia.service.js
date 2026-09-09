import apiClient from './client';

export const AiService = {
  /**
   * Appelle l'IA Gemini pour générer 3 fausses réponses (distracteurs) pour un QCM.
   * @param {string} enonce - La question posée.
   * @param {string} bonne_reponse - La réponse correcte attendue.
   * @returns {Promise<Array>} Un tableau contenant 3 chaînes de caractères (les distracteurs).
   */
  generateDistractors: async (enonce, bonne_reponse) => {
    const response = await apiClient.post('/ia/distracteurs/', {
      enonce,
      bonne_reponse
    });
    return response.data.distracteurs;
  },
  
  // (Préparation pour la suite) Tester la connexion
  testConnection: async () => {
    const response = await apiClient.get('/ia/test-connexion/');
    return response.data;
  }
};