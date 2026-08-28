import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { QuizService } from '../api/quiz.service';
import '../styles/index.css';

// Icônes inline, cohérentes avec le reste du design system —
// remplacent 🗑️ ⬇️ 🚀 par des glyphes vectoriels sobres en currentColor.
const IconTrash = (props) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M4 7h16" />
    <path d="M10 11v6M14 11v6" />
    <path d="M6 7l1 13a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-13" />
    <path d="M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3" />
  </svg>
);

const IconPublish = (props) => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M12 19V6" />
    <path d="m6 11 6-6 6 6" />
    <path d="M5 19h14" />
  </svg>
);

const IconUnpublish = (props) => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M12 5v13" />
    <path d="m18 13-6 6-6-6" />
  </svg>
);

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

  const handleToggleStatus = async (quiz) => {
    const newStatus = quiz.status === 'published' ? 'draft' : 'published';
    const actionText = newStatus === 'published' ? "publier ce quiz" : "remettre ce quiz en brouillon";

    if (!window.confirm(`Voulez-vous vraiment ${actionText} ?`)) return;

    try {
      await QuizService.updateStatus(quiz.id, newStatus);
      // Mise à jour locale du statut
      setQuizzes(quizzes.map(q => q.id === quiz.id ? { ...q, status: newStatus } : q));
    } catch (err) {
      const errorMsg = err.response?.data?.status?.[0] || err.response?.data?.detail || "Erreur lors de la modification du statut.";
      alert(`Action refusée : ${errorMsg}`);
    }
  };

  const handleDeleteQuiz = async (quiz) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer le quiz "${quiz.titre || `Quiz #${quiz.id}`}" ?`)) return;

    try {
      await QuizService.deleteQuiz(quiz.id);
      // Retrait du quiz de l'affichage
      setQuizzes(quizzes.filter(q => q.id !== quiz.id));
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Erreur lors de la suppression.";
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

        {/* EN-TÊTE DE LA PAGE */}
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

        {/* CONTENU */}
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

                  {/* EN-TÊTE DE LA CARTE : Titre et suppression */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
                    <div className="lms-tile__title" style={{ margin: 0 }}>
                      {quiz.titre || `Quiz #${quiz.id}`}
                    </div>

                    <button
                      onClick={() => handleDeleteQuiz(quiz)}
                      className="lms-icon-action"
                      aria-label="Supprimer ce quiz"
                      title="Supprimer ce quiz"
                    >
                      <IconTrash />
                    </button>
                  </div>

                  {/* MÉTADONNÉES */}
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

                {/* PIED DE CARTE : Actions */}
                <div className="lms-tile__footer" style={{ flexWrap: 'wrap', gap: 'var(--space-2)', marginTop: 'var(--space-4)' }}>

                  {/* Bouton de statut (Pleine largeur) */}
                  <button
                    className={`lms-btn ${quiz.status === 'published' ? 'lms-btn--outline' : 'lms-btn--success'}`}
                    style={{ flex: '1 1 100%' }}
                    onClick={() => handleToggleStatus(quiz)}
                  >
                    {quiz.status === 'published' ? (
                      <>
                        <IconUnpublish />
                        Repasser en brouillon
                      </>
                    ) : (
                      <>
                        <IconPublish />
                        Publier le quiz
                      </>
                    )}
                  </button>

                  {/* Bouton pour visualiser les questions assignées */}
                  <button
                    className="lms-btn lms-btn--outline"
                    style={{ flex: 1 }}
                    onClick={() => navigate(`/quizzes/${quiz.id}/questions`)}
                  >
                    Questions
                  </button>

                  {/* Bouton pour assigner de nouvelles questions depuis la banque */}
                  <button
                    className="lms-btn lms-btn--ghost"
                    style={{ flex: 1, border: '1px solid var(--color-border-strong)' }}
                    onClick={() => navigate(`/quizzes/${quiz.id}/assign`)}
                  >
                    Assigner
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
