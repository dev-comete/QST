import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { StudentQuizService } from '../api/studentQuiz.service';
import '../styles/index.css';

export default function StudentDashboardPage() {
  const [quizzes, setQuizzes] = useState([]);
  const [vagues, setVagues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // 🌟 NOUVEAU : On charge les deux en parallèle pour plus de performance !
        const [quizzesData, vaguesData] = await Promise.all([
          StudentQuizService.getMyQuizzes(),
          StudentQuizService.getMyVagues()
        ]);
        
        setQuizzes(quizzesData.results || quizzesData);
        setVagues(vaguesData.results || vaguesData);
      } catch (err) {
        setError("Impossible de charger votre espace.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
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

  const quizzesAFaire = quizzes.filter(q => !q.termine);
  const quizzesTermines = quizzes.filter(q => q.termine);

  return (
    <div className="lms-scope lms-page">
      <div className="lms-container">
        
        <div className="lms-card lms-card--pad-lg lms-header-row" style={{ marginBottom: 'var(--space-6)', borderTop: '4px solid var(--color-primary)' }}>
          <div>
            <h1 className="lms-pageheader__title">Mon Espace Apprenant</h1>
            <p className="lms-pageheader__subtitle">Retrouvez ici toutes vos évaluations et bulletins.</p>
          </div>
        </div>

        {error && <div className="lms-alert lms-alert--danger" style={{ marginBottom: 'var(--space-4)' }}>{error}</div>}

        <div className="lms-stack" style={{ gap: 'var(--space-6)' }}>
          
          {/* 🌟 NOUVELLE SECTION : MES FORMATIONS ET BULLETINS */}
          {vagues.length > 0 && (
            <div className="lms-card">
              <div className="lms-card__header">
                <h2 className="lms-card__title">Mes Formations & Bulletins</h2>
              </div>
              
              <div className="lms-grid lms-grid--3" style={{ padding: 'var(--space-4)', gap: 'var(--space-4)' }}>
                {vagues.map(vague => (
                  <div key={vague.vague_id} className="lms-card lms-card--pad-lg" style={{ backgroundColor: 'var(--color-surface-hover)', border: '1px solid var(--color-border)', boxShadow: 'none' }}>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-2)' }}>Session de formation</div>
                    <h3 className="lms-card__title" style={{ fontSize: 'var(--text-md)', marginBottom: 'var(--space-4)' }}>{vague.formation_nom}</h3>
                    <button 
                      className="lms-btn lms-btn--outline lms-btn--block"
                      onClick={() => navigate(`/student/vagues/${vague.vague_id}/bulletin`)}
                    >
                      🎓 Voir mon bulletin
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

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