import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { StudentQuizService } from '../api/studentQuiz.service';

export default function StudentDashboardPage() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMyQuizzes = async () => {
      try {
        // Gère le cas où DRF renvoie { results: [...] } ou directement le tableau
        const data = await StudentQuizService.getMyQuizzes();
        setQuizzes(data.results || data);
      } catch (err) {
        setError("Impossible de charger vos quiz.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchMyQuizzes();
  }, []);

  if (loading) {
    return (
      <div className="lms-scope lms-page">
        <div className="lms-container lms-loading">
          <span className="lms-spinner" />
          Chargement de votre espace...
        </div>
      </div>
    );
  }

  // On sépare les quiz à faire et ceux terminés
  const quizzesAFaire = quizzes.filter(q => !q.termine);
  const quizzesTermines = quizzes.filter(q => q.termine);

  return (
    <div className="lms-scope lms-page">
      <div className="lms-container">
        
        <div className="lms-card lms-card--pad-lg lms-header-row" style={{ marginBottom: 'var(--space-6)' }}>
          <div>
            <h1 className="lms-pageheader__title">Mon Espace Apprenant</h1>
            <p className="lms-pageheader__subtitle">Retrouvez ici toutes vos évaluations en cours et passées.</p>
          </div>
        </div>

        {error && <div style={{ color: 'var(--color-danger)', marginBottom: 'var(--space-4)' }}>{error}</div>}

        <div className="lms-stack" style={{ gap: 'var(--space-6)' }}>
          
          {/* SECTION : À FAIRE */}
          <div className="lms-card">
            <div className="lms-card__header">
              <h2 className="lms-card__title">Évaluations à faire ({quizzesAFaire.length})</h2>
            </div>
            
            <div className="lms-card__body" style={{ padding: 0 }}>
              {quizzesAFaire.length === 0 ? (
                <div style={{ padding: 'var(--space-5)', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                  Super ! Vous n'avez aucun quiz en attente.
                </div>
              ) : (
                <table className="lms-table">
                  <thead>
                    <tr>
                      <th>Formation</th>
                      <th>Titre du Quiz</th>
                      <th style={{ textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quizzesAFaire.map(quiz => (
                      <tr key={quiz.quiz_id}>
                        <td className="lms-table__name">{quiz.formation_nom}</td>
                        <td>{quiz.quiz_titre || `Quiz #${quiz.quiz_id}`}</td>
                        <td style={{ textAlign: 'right' }}>
                          <button 
                            className="lms-btn lms-btn--primary lms-btn--sm"
                            onClick={() => navigate(`/student/quizzes/${quiz.quiz_id}/take`)}
                          >
                            Démarrer
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* SECTION : TERMINÉS */}
          <div className="lms-card">
            <div className="lms-card__header">
              <h2 className="lms-card__title">Évaluations terminées ({quizzesTermines.length})</h2>
            </div>
            
            <div className="lms-card__body" style={{ padding: 0 }}>
              {quizzesTermines.length === 0 ? (
                <div style={{ padding: 'var(--space-5)', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                  Vous n'avez pas encore terminé de quiz.
                </div>
              ) : (
                <table className="lms-table">
                  <thead>
                    <tr>
                      <th>Formation</th>
                      <th>Titre du Quiz</th>
                      <th>Score Obtenu</th>
                      <th style={{ textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quizzesTermines.map(quiz => (
                      <tr key={quiz.quiz_id}>
                        <td className="lms-table__name">{quiz.formation_nom}</td>
                        <td>{quiz.quiz_titre || `Quiz #${quiz.quiz_id}`}</td>
                        <td>
                          <strong>{quiz.score_obtenu} pts</strong>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button 
                            className="lms-btn lms-btn--outline lms-btn--sm"
                            onClick={() => navigate(`/student/quizzes/${quiz.quiz_id}/review`)}
                          >
                            Voir la correction
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}