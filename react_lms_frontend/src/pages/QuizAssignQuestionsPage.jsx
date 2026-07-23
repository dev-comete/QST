import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';

import { QuestionService } from '../api/question.service';
import { AssignmentService } from '../api/assignement.service';
import useDebounce from '../hooks/useDebounce';

const QuizAssignQuestionsPage = () => {
  const { id: quizId } = useParams(); // Récupère l'ID du quiz depuis l'URL
  const navigate = useNavigate();

  // États pour les données de base
  const [types, setTypes] = useState([]);
  const [baremes, setBaremes] = useState([]);
  const [bankQuestions, setBankQuestions] = useState([]);
  
  // État pour les questions sélectionnées (Panier)
  const [selectedQuestions, setSelectedQuestions] = useState([]);

  // États pour la recherche dans la banque
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // 1. Charger les types, barèmes, et questions initiales
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [typesData, baremesData] = await Promise.all([
          AssignmentService.getTypes(),
          AssignmentService.getBaremes()
        ]);
        setTypes(typesData);
        setBaremes(baremesData);
        fetchBankQuestions();
      } catch (err) {
        console.error(err);
        setError("Erreur lors du chargement des données.");
      }
    };
    fetchInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2. Recharger la banque de questions si on fait une recherche
  useEffect(() => {
    fetchBankQuestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchTerm]);

  const fetchBankQuestions = async () => {
    setLoading(true);
    try {
      const data = await QuestionService.getBankQuestions(debouncedSearchTerm, '', 1);
      setBankQuestions(data.results || data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 3. Ajouter une question à la sélection
  const handleAddQuestion = (question) => {
    // Éviter les doublons
    if (selectedQuestions.find(q => q.question_id === question.id)) return;

    setSelectedQuestions([
      ...selectedQuestions,
      {
        question_id: question.id,
        texte_enonce: question.enonce_question, // Pour l'affichage uniquement
        type_id: '', // À remplir par l'utilisateur
        bareme_pts: '' // À remplir par l'utilisateur
      }
    ]);
  };

  // 4. Retirer une question de la sélection
  const handleRemoveQuestion = (questionId) => {
    setSelectedQuestions(selectedQuestions.filter(q => q.question_id !== questionId));
  };

  // 5. Mettre à jour les paramètres d'une question sélectionnée (Type / Barème)
  const handleQuestionParamChange = (questionId, field, value) => {
    const updatedList = selectedQuestions.map(q => {
      if (q.question_id === questionId) {
        return { ...q, [field]: field === 'type_id' ? parseInt(value) : value };
      }
      return q;
    });
    setSelectedQuestions(updatedList);
  };

  // 6. Soumettre le payload final
  const handleSubmit = async () => {
    // Validation : Vérifier que toutes les questions ont un type et un barème
    const isValid = selectedQuestions.every(q => q.type_id !== '' && q.bareme_pts !== '');
    if (!isValid) {
      setError("Veuillez sélectionner un type et un barème pour toutes les questions choisies.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    // Préparation du Payload selon votre format JSON
    const payload = {
      quiz_id: parseInt(quizId),
      questions_choisies: selectedQuestions.map(q => ({
        question_id: q.question_id,
        type_id: q.type_id,
        // Conversion en nombre si le backend attend un entier pour bareme_pts
        bareme_pts: parseFloat(q.bareme_pts) 
      }))
    };

    try {
      await AssignmentService.assignQuestions(payload);
      alert("Questions assignées avec succès !");
      navigate('/quizzes');
    } catch (err) {
      console.error(err);
      setError("Erreur lors de l'assignation des questions.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container" style={{ marginTop: '30px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Assigner des questions (Quiz #{quizId})</h2>
        <Link to="/quizzes" className="btn" style={{ backgroundColor: '#6c757d', textDecoration: 'none' }}>
          Retour aux Quiz
        </Link>
      </div>

      {error && <div className="text-danger card" style={{ padding: '15px', marginBottom: '20px' }}>{error}</div>}

      <div style={{ display: 'flex', gap: '20px' }}>
        
        {/* COLONNE GAUCHE : BANQUE DE QUESTIONS */}
        <div style={{ flex: 1 }} className="card">
          <h4 style={{ marginBottom: '15px' }}>Banque de Questions</h4>
          <input 
            type="text" 
            className="form-control" 
            placeholder="Rechercher une question..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ marginBottom: '15px' }}
          />
          
          {loading ? <p>Chargement...</p> : (
            <div style={{ maxHeight: '500px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {bankQuestions.map(q => (
                <div key={q.id} style={{ border: '1px solid #ddd', padding: '10px', borderRadius: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.9rem', flex: 1 }}>{q.enonce_question}</span>
                  <button 
                    onClick={() => handleAddQuestion(q)}
                    disabled={selectedQuestions.find(sq => sq.question_id === q.id)}
                    className="btn" 
                    style={{ padding: '4px 8px', fontSize: '0.8rem', backgroundColor: selectedQuestions.find(sq => sq.question_id === q.id) ? '#ccc' : '#28a745', marginLeft: '10px' }}
                  >
                    {selectedQuestions.find(sq => sq.question_id === q.id) ? 'Ajouté' : 'Ajouter'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* COLONNE DROITE : QUESTIONS SÉLECTIONNÉES */}
        <div style={{ flex: 1 }} className="card">
          <h4 style={{ marginBottom: '15px' }}>Questions Choisies ({selectedQuestions.length})</h4>
          
          {selectedQuestions.length === 0 ? (
            <p style={{ color: '#666', textAlign: 'center', marginTop: '20px' }}>Aucune question sélectionnée.</p>
          ) : (
            <div style={{ maxHeight: '430px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '15px' }}>
              {selectedQuestions.map((q, index) => (
                <div key={q.question_id} style={{ backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '4px', border: '1px solid #e9ecef' }}>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <strong>{index + 1}. {q.texte_enonce}</strong>
                    <button onClick={() => handleRemoveQuestion(q.question_id)} style={{ color: '#dc3545', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>X</button>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '10px' }}>
                    {/* Select pour le Type */}
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: '0.8rem' }}>Type *</label>
                      <select 
                        className="form-control" 
                        value={q.type_id} 
                        onChange={(e) => handleQuestionParamChange(q.question_id, 'type_id', e.target.value)}
                        style={{ padding: '4px', fontSize: '0.9rem' }}
                      >
                        <option value="" disabled>Choisir...</option>
                        {types.map(t => (
                          <option key={t.id} value={t.id}>{t.type_utilisateur || `Type #${t.id}`}</option>
                        ))}
                      </select>
                    </div>
                    
                    {/* Select pour le Barème */}
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: '0.8rem' }}>Barème (Points) *</label>
                      <select 
                        className="form-control" 
                        value={q.bareme_pts} 
                        onChange={(e) => handleQuestionParamChange(q.question_id, 'bareme_pts', e.target.value)}
                        style={{ padding: '4px', fontSize: '0.9rem' }}
                      >
                        <option value="" disabled>Choisir...</option>
                        {baremes.map(b => (
                          // Ajustez b.points ou b.valeur selon le champ exact de votre JSON de barèmes
                          <option key={b.id} value={b.points || b.valeur || b.id}>{b.points || b.valeur || b.id} pts</option> 
                        ))}
                      </select>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          )}

          <button 
            onClick={handleSubmit} 
            className="btn" 
            style={{ width: '100%', backgroundColor: '#0056b3' }}
            disabled={selectedQuestions.length === 0 || isSubmitting}
          >
            {isSubmitting ? 'Enregistrement...' : 'Sauvegarder l\'assignation'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default QuizAssignQuestionsPage;