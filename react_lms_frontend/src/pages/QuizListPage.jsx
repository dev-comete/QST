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

  // 🌟 NOUVEAU : Fonction pour basculer le statut
  const handleToggleStatus = async (quiz) => {
    const newStatus = quiz.status === 'published' ? 'draft' : 'published';
    const actionText = newStatus === 'published' ? "publier ce quiz" : "remettre ce quiz en brouillon";

    if (!window.confirm(`Voulez-vous vraiment ${actionText} ?`)) return;

    try {
      await QuizService.updateStatus(quiz.id, newStatus);
      
      // Mise à jour de l'état local sans recharger toute la page
      setQuizzes(quizzes.map(q => q.id === quiz.id ? { ...q, status: newStatus } : q));
      
    } catch (err) {
      // DRF renvoie les erreurs de validation sous forme d'objet: {"status": ["Message d'erreur"]}
      const errorMsg = err.response?.data?.status?.[0] || err.response?.data?.detail || "Erreur lors de la modification du statut.";
      alert(`Action refusée : ${errorMsg}`);
    }
  };

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
              <div key={quiz.id} className="lms-tile" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div style={{ flex: 1 }}>
                  <div className="lms-tile__title">{quiz.titre || `Quiz #${quiz.id}`}</div>

                  <p className="lms-tile__meta">
                    Statut :{' '}
                    <span className={`lms-badge ${quiz.status === 'published' ? 'lms-badge--success' : 'lms-badge--warning'}`}>
                      <span className="lms-badge-dot" />
                      {quiz.status === 'published' ? 'Publié' : 'Brouillon'}
                    </span>
                  </p>

                  <p className="lms-tile__meta">
                    Durée : <strong className="lms-num">{quiz.duree}</strong>
                  </p>

                  <p className="lms-tile__timestamp">
                    Créé le {formatDate(quiz.date_creation_quiz)}
                  </p>
                </div>

                {/* 🌟 FOOTER MIS À JOUR : Ajout du bouton principal de publication */}
                <div className="lms-tile__footer" style={{ flexWrap: 'wrap', gap: 'var(--space-2)', marginTop: 'var(--space-4)' }}>
                  
                  {/* Bouton de statut (Prend toute la largeur en haut) */}
                  <button
                    className={`lms-btn ${quiz.status === 'published' ? 'lms-btn--outline' : 'lms-btn--success'}`}
                    style={{ flex: '1 1 100%' }}
                    onClick={() => handleToggleStatus(quiz)}
                  >
                    {quiz.status === 'published' ? '⬇Repasser en brouillon' : ' Publier'}
                  </button>

                  <button className="lms-btn lms-btn--outline" style={{ flex: 1 }}>
                    Paramètres
                  </button>
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