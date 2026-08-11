import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';

import { QuestionService } from '../api/question.service';
import { AssignmentService } from '../api/assignement.service';
import useDebounce from '../hooks/useDebounce';
import '../styles/index.css';

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
    <div className="lms-scope lms-page">
      <div className="lms-container">
        <div className="lms-header-row" style={{ marginBottom: 'var(--space-6)' }}>
          <h1 className="lms-pageheader__title">Assigner des questions — Quiz #{quizId}</h1>
          <Link to="/quizzes" className="lms-btn lms-btn--outline">
            Retour aux quiz
          </Link>
        </div>

        {error && <div className="lms-alert lms-alert--danger" style={{ marginBottom: 'var(--space-5)' }}>{error}</div>}

        <div className="lms-grid lms-grid--2">

          {/* COLONNE GAUCHE : BANQUE DE QUESTIONS */}
          <div className="lms-card">
            <div className="lms-card__title" style={{ marginBottom: 'var(--space-4)' }}>Banque de questions</div>
            <input
              type="text"
              className="lms-input"
              placeholder="Rechercher une question…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ marginBottom: 'var(--space-4)' }}
            />

            {loading ? (
              <div className="lms-loading"><span className="lms-spinner" />Chargement…</div>
            ) : (
              <div className="lms-picker">
                {bankQuestions.map(q => {
                  const isAdded = selectedQuestions.find(sq => sq.question_id === q.id);
                  return (
                    <div key={q.id} className="lms-picker-item">
                      <span className="lms-picker-item__text">{q.enonce_question}</span>
                      <button
                        onClick={() => handleAddQuestion(q)}
                        disabled={isAdded}
                        className={`lms-btn lms-btn--sm ${isAdded ? 'lms-btn--ghost' : 'lms-btn--success'}`}
                      >
                        {isAdded ? 'Ajouté' : 'Ajouter'}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* COLONNE DROITE : QUESTIONS SÉLECTIONNÉES */}
          <div className="lms-card">
            <div className="lms-card__title" style={{ marginBottom: 'var(--space-4)' }}>
              Questions choisies ({selectedQuestions.length})
            </div>

            {selectedQuestions.length === 0 ? (
              <p style={{ color: 'var(--color-slate)', textAlign: 'center', marginTop: 'var(--space-5)' }}>
                Aucune question sélectionnée.
              </p>
            ) : (
              <div className="lms-picker" style={{ marginBottom: 'var(--space-4)' }}>
                {selectedQuestions.map((q, index) => (
                  <div key={q.question_id} className="lms-selected-item">

                    <div className="lms-selected-item__head">
                      <strong className="lms-selected-item__title">{index + 1}. {q.texte_enonce}</strong>
                      <button onClick={() => handleRemoveQuestion(q.question_id)} className="lms-remove-btn">✕</button>
                    </div>

                    <div className="lms-selected-item__row">
                      {/* Select pour le Type */}
                      <div className="lms-selected-item__field">
                        <label>Type *</label>
                        <select
                          className="lms-select"
                          value={q.type_id}
                          onChange={(e) => handleQuestionParamChange(q.question_id, 'type_id', e.target.value)}
                        >
                          <option value="" disabled>Choisir…</option>
                          {types.map(t => (
                            <option key={t.id} value={t.id}>{t.type_utilisateur || `Type #${t.id}`}</option>
                          ))}
                        </select>
                      </div>

                      {/* Select pour le Barème */}
                      <div className="lms-selected-item__field">
                        <label>Barème (points) *</label>
                        <select
                          className="lms-select"
                          value={q.bareme_pts}
                          onChange={(e) => handleQuestionParamChange(q.question_id, 'bareme_pts', e.target.value)}
                        >
                          <option value="" disabled>Choisir…</option>
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
              className="lms-btn lms-btn--primary lms-btn--block"
              disabled={selectedQuestions.length === 0 || isSubmitting}
            >
              {isSubmitting ? 'Enregistrement…' : "Sauvegarder l'assignation"}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default QuizAssignQuestionsPage;
