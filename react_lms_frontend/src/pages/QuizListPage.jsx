import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { QuizService } from '../api/quiz.service';
import '../styles/index.css';

const IconTrash = (props) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M4 7h16" />
    <path d="M10 11v6M14 11v6" />
    <path d="M6 7l1 13a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-13" />
    <path d="M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3" />
  </svg>
);

const IconEdit = (props) => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
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

// 🌟 NOUVELLE ICÔNE RESTAURER
const IconRestore = (props) => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
  </svg>
);

const QuizListPage = () => {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // 🌟 NOUVEL ÉTAT : Mode Corbeille
  const [showTrash, setShowTrash] = useState(false);

  useEffect(() => {
    fetchQuizzes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showTrash]); // Se déclenche à chaque changement du toggle

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      // 🌟 Bascule entre les quiz actifs et la corbeille
      const data = showTrash 
        ? await QuizService.getTrashQuizzes() 
        : await QuizService.getQuizzes();
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
      setQuizzes(quizzes.filter(q => q.id !== quiz.id));
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Erreur lors de la suppression.";
      alert(`Action refusée : ${errorMsg}`);
    }
  };

  // 🌟 NOUVELLE FONCTION : Restaurer
  const handleRestoreQuiz = async (quiz) => {
    if (!window.confirm(`Voulez-vous restaurer le quiz "${quiz.titre || `Quiz #${quiz.id}`}" ?`)) return;
    try {
      await QuizService.restoreQuiz(quiz.id);
      // On le retire de la vue corbeille
      setQuizzes(quizzes.filter(q => q.id !== quiz.id));
    } catch (err) {
      alert("Erreur lors de la restauration.");
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
            <h1 className="lms-pageheader__title">
              {showTrash ? "Corbeille des quiz" : "Gestion des quiz"}
            </h1>
            <p className="lms-pageheader__subtitle">
              {showTrash 
                ? "Retrouvez et restaurez vos évaluations supprimées." 
                : "Créez, publiez et notez vos évaluations."}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            <button
              className="lms-btn lms-btn--outline"
              onClick={() => setShowTrash(!showTrash)}
            >
              {showTrash ? "🔙 Retour aux actifs" : <><IconTrash /> Voir la corbeille</>}
            </button>
            {!showTrash && (
              <button
                className="lms-btn lms-btn--success"
                onClick={() => navigate('/quizzes/create')}
              >
                + Créer un nouveau quiz
              </button>
            )}
          </div>
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
            <p className="lms-empty__title">{showTrash ? "Corbeille vide" : "Aucun quiz pour l'instant"}</p>
            <p>{showTrash ? "Aucun quiz n'a été supprimé." : "Créez votre premier quiz pour commencer à évaluer vos apprenants."}</p>
          </div>
        ) : (
          <div className="lms-grid lms-grid--3">
            {quizzes.map((quiz) => (
              <div key={quiz.id} className="lms-tile" style={{ display: 'flex', flexDirection: 'column', height: '100%', opacity: showTrash ? 0.8 : 1 }}>
                <div style={{ flex: 1 }}>

                  {/* EN-TÊTE DE LA CARTE */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
                    <div className="lms-tile__title" style={{ margin: 0 }}>
                      {quiz.titre || `Quiz #${quiz.id}`}
                    </div>

                    {!showTrash && (
                      <div style={{ display: 'flex', gap: '0.15rem', flexShrink: 0 }}>
                        <button
                          onClick={() => navigate(`/quizzes/${quiz.id}/edit`)}
                          className="lms-icon-action lms-icon-action--neutral"
                          title="Modifier"
                        >
                          <IconEdit />
                        </button>
                        <button
                          onClick={() => handleDeleteQuiz(quiz)}
                          className="lms-icon-action"
                          title="Supprimer"
                        >
                          <IconTrash />
                        </button>
                      </div>
                    )}
                  </div>

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

                {/* PIED DE CARTE */}
                <div className="lms-tile__footer" style={{ flexWrap: 'wrap', gap: 'var(--space-2)', marginTop: 'var(--space-4)' }}>
                  
                  {showTrash ? (
                    // 🌟 ACTIONS EN MODE CORBEILLE
                    <button
                      className="lms-btn lms-btn--success"
                      style={{ flex: '1 1 100%' }}
                      onClick={() => handleRestoreQuiz(quiz)}
                    >
                      <IconRestore style={{ marginRight: '8px' }} />
                      Restaurer ce quiz
                    </button>
                  ) : (
                    // ACTIONS EN MODE NORMAL
                    <>
                      <button
                        className={`lms-btn ${quiz.status === 'published' ? 'lms-btn--outline' : 'lms-btn--success'}`}
                        style={{ flex: '1 1 100%' }}
                        onClick={() => handleToggleStatus(quiz)}
                      >
                        {quiz.status === 'published' ? (
                          <><IconUnpublish /> Repasser en brouillon</>
                        ) : (
                          <><IconPublish /> Publier le quiz</>
                        )}
                      </button>
                      <button
                        className="lms-btn lms-btn--outline"
                        style={{ flex: 1 }}
                        onClick={() => navigate(`/quizzes/${quiz.id}/questions`)}
                      >
                        Questions
                      </button>
                      <button
                        className="lms-btn lms-btn--ghost"
                        style={{ flex: 1, border: '1px solid var(--color-border-strong)' }}
                        onClick={() => navigate(`/quizzes/${quiz.id}/assign`)}
                      >
                        Assigner
                      </button>
                    </>
                  )}
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