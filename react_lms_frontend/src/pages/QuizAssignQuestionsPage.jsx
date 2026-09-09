import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';

import { QuestionService } from '../api/question.service';
import { AssignmentService } from '../api/assignement.service';
import { QuizService } from '../api/quiz.service';
import useDebounce from '../hooks/useDebounce';
import '../styles/index.css';
import { notify } from '../lib/notify';

const QuizAssignQuestionsPage = () => {
  const { id: quizId } = useParams();
  const navigate = useNavigate();

  // IDs des questions déjà assignées au quiz
  const [assignedQuestionIds, setAssignedQuestionIds] = useState([]);

  // Questions de la banque (déjà filtrées côté backend via exclude_quiz)
  const [bankQuestions, setBankQuestions] = useState([]);

  // Questions sélectionnées (panier)
  const [selectedQuestions, setSelectedQuestions] = useState([]);

  // Recherche
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // 1. Charger les questions déjà assignées, puis la banque, au montage
  useEffect(() => {
    fetchAssignedQuestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2. Recharger la banque quand la recherche change OU quand on connait enfin
  //    les questions assignées (pour que exclude_quiz soit envoyé dès le 1er appel utile)
  useEffect(() => {
    fetchBankQuestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchTerm, assignedQuestionIds]);

  const fetchAssignedQuestions = async () => {
    try {
      const data = await QuizService.getAssignedQuestions(quizId);
      const items = data.results || data;
      const ids = items.map(item => parseInt(item.question_id, 10));
      setAssignedQuestionIds(ids);
    } catch (err) {
      console.error("Impossible de charger les questions déjà assignées", err);
      setAssignedQuestionIds([]);
    }
  };

  const fetchBankQuestions = async () => {
    setLoading(true);
    try {
      const data = await QuestionService.getBankQuestions(debouncedSearchTerm, '', 1, quizId);
      setBankQuestions(data.results || data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuestion = (question) => {
    if (selectedQuestions.find(q => q.question_id === question.id)) return;

    setSelectedQuestions([
      ...selectedQuestions,
      {
        question_id: question.id,
        texte_enonce: question.enonce_question,
        // 🌟 NOUVEAU : On pré-remplit l'input avec le barème initial du backend !
        bareme_pts: question.bareme_pts ? question.bareme_pts.toString() : ''
      }
    ]);
  };

  const handleRemoveQuestion = (questionId) => {
    setSelectedQuestions(selectedQuestions.filter(q => q.question_id !== questionId));
  };

  const handleQuestionParamChange = (questionId, value) => {
    const updatedList = selectedQuestions.map(q => {
      if (q.question_id === questionId) {
        return { ...q, bareme_pts: value };
      }
      return q;
    });
    setSelectedQuestions(updatedList);
  };

  const handleSubmit = async () => {
    const isValid = selectedQuestions.every(q => q.bareme_pts !== '' && parseFloat(q.bareme_pts) > 0);

    if (!isValid) {
      setError("Veuillez saisir un barème valide (points) pour toutes les questions choisies.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const payload = {
      quiz_id: parseInt(quizId),
      questions_choisies: selectedQuestions.map(q => ({
        question_id: q.question_id,
        bareme_pts: parseFloat(q.bareme_pts)
      }))
    };

    try {
      await AssignmentService.assignQuestions(payload);
      notify({ type: 'success', message: 'Questions assignées avec succès !' });
      navigate(`/quizzes/${quizId}/questions`);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Erreur lors de l'assignation des questions.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const availableQuestions = bankQuestions.filter(q =>
    !assignedQuestionIds.includes(parseInt(q.id, 10))
  );

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
              <div className="lms-picker" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {availableQuestions.length === 0 ? (
                  <div style={{ padding: 'var(--space-4)', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                    Toutes les questions disponibles sont déjà dans le quiz, ou aucun résultat pour votre recherche.
                  </div>
                ) : (
                  availableQuestions.map(q => {
                    const isAdded = selectedQuestions.find(sq => sq.question_id === q.id);
                    return (
                      <div key={q.id} className="lms-picker-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-3)', borderBottom: '1px solid var(--color-border)' }}>
                        <div style={{ flex: 1, paddingRight: 'var(--space-3)' }}>
                          <span className="lms-picker-item__text" style={{ display: 'block' }}>{q.enonce_question}</span>
                          
                          {/* 🌟 NOUVEAU : On affiche le barème par défaut visuellement */}
                          {q.bareme_pts > 0 && (
                            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-slate)', marginTop: '4px', display: 'inline-block' }}>
                              Défaut : <strong>{q.bareme_pts} pts</strong>
                            </span>
                          )}
                        </div>
                        
                        <button
                          onClick={() => handleAddQuestion(q)}
                          disabled={isAdded}
                          className={`lms-btn lms-btn--sm ${isAdded ? 'lms-btn--ghost' : 'lms-btn--success'}`}
                        >
                          {isAdded ? 'Dans le panier' : 'Sélectionner'}
                        </button>
                      </div>
                    );
                  })
                )}
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
                  <div key={q.question_id} className="lms-selected-item" style={{ padding: 'var(--space-3)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-3)' }}>

                    <div className="lms-selected-item__head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-3)' }}>
                      <strong className="lms-selected-item__title">{index + 1}. {q.texte_enonce}</strong>
                      <button
                        onClick={() => handleRemoveQuestion(q.question_id)}
                        className="lms-btn lms-btn--ghost lms-btn--sm"
                        style={{ color: 'var(--color-danger)', padding: '4px 8px' }}
                      >
                        ✕
                      </button>
                    </div>

                    <div className="lms-selected-item__row">
                      <div className="lms-selected-item__field" style={{ width: '50%' }}>
                        <label className="lms-label">Points *</label>
                        <input
                          type="number"
                          min="0.1"
                          step="0.1"
                          className="lms-input"
                          placeholder="Ex: 2.5"
                          value={q.bareme_pts}
                          onChange={(e) => handleQuestionParamChange(q.question_id, e.target.value)}
                        />
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