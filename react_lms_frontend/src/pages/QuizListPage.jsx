import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { QuizService } from '../api/quiz.service';
import '../styles/index.css';

const QuizListPage = () => {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const data = await QuizService.getQuizzes();
      setQuizzes(data.results || data);
    } catch (err) {
      setError("Impossible de charger les quiz.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Petite fonction utilitaire pour formater la date proprement
  const formatDate = (dateString) => {
    if (!dateString) return 'Date inconnue';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="lms-scope lms-page">
      <div className="lms-container">
        <div className="lms-pageheader">
          <div>
            <h1 className="lms-pageheader__title">Gestion des quiz</h1>
            <p className="lms-pageheader__subtitle">Créez, publiez et notez vos évaluations.</p>
          </div>
          <button
            className="lms-btn lms-btn--success"
            onClick={() => navigate('/quizzes/create')}
          >
            + Créer un nouveau quiz
          </button>
        </div>

        {error && <div className="lms-alert lms-alert--danger" style={{ marginBottom: 'var(--space-5)' }}>{error}</div>}

        {loading ? (
          <div className="lms-loading">
            <span className="lms-spinner" />
            Chargement des quiz…
          </div>
        ) : quizzes.length === 0 ? (
          <div className="lms-empty">
            <p className="lms-empty__title">Aucun quiz pour l'instant</p>
            <p>Créez votre premier quiz pour commencer à évaluer vos apprenants.</p>
          </div>
        ) : (
          <div className="lms-grid lms-grid--3">
            {quizzes.map((quiz) => (
              <div key={quiz.id} className="lms-tile">
                <div>
                  <div className="lms-tile__title">Quiz #{quiz.id}</div>

                  <p className="lms-tile__meta">
                    Statut :{' '}
                    <span className={`lms-badge ${quiz.status === 'published' ? 'lms-badge--success' : 'lms-badge--warning'}`}>
                      <span className="lms-badge-dot" />
                      {quiz.status === 'published' ? 'Publié' : 'Brouillon'}
                    </span>
                  </p>

                  <p className="lms-tile__meta">
                    Formation ID : <strong>{quiz.formation}</strong>
                  </p>

                  <p className="lms-tile__meta">
                    Durée : <strong className="lms-num">{quiz.duree}</strong>
                  </p>

                  <p className="lms-tile__timestamp">
                    Créé le {formatDate(quiz.date_creation_quiz)}
                  </p>
                </div>

                <div className="lms-tile__footer">
                  <button className="lms-btn lms-btn--outline" style={{ flex: 1 }}>Paramètres</button>
                  <button
                    className="lms-btn lms-btn--ghost"
                    style={{ flex: 1, border: '1px solid var(--color-border-strong)' }}
                    onClick={() => navigate(`/quizzes/${quiz.id}/assign`)}
                  >
                    Questions
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizListPage;
