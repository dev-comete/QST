import React, { useState, useEffect } from 'react';
import { QuestionService } from '../api/question.service';
import useDebounce from '../hooks/useDebounce';
import { useNavigate } from 'react-router-dom';
import { notify, confirm } from '../lib/notify';
import '../styles/index.css';

// 🌟 ICÔNES
const IconTrash = (props) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M4 7h16" />
    <path d="M10 11v6M14 11v6" />
    <path d="M6 7l1 13a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-13" />
    <path d="M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3" />
  </svg>
);

const IconRestore = (props) => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
  </svg>
);

// 🌟 NOUVELLE ICÔNE : Édition
const IconEdit = (props) => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
  </svg>
);

const QuestionBankPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeCode, setTypeCode] = useState('');
  const [page, setPage] = useState(1);

  const [data, setData] = useState({ results: [], count: 0, next: null, previous: null });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [showTrash, setShowTrash] = useState(false);

  const navigate = useNavigate();
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  useEffect(() => {
    fetchQuestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchTerm, typeCode, page, showTrash]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearchTerm, typeCode, showTrash]);

  const fetchQuestions = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = showTrash 
        ? await QuestionService.getTrashQuestions(debouncedSearchTerm, typeCode, page)
        : await QuestionService.getBankQuestions(debouncedSearchTerm, typeCode, page);
      setData(response);
    } catch (err) {
      setError("Impossible de charger les questions. Vérifiez votre connexion.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRestoreQuestion = async (questionId) => {
    const confirmed = await confirm("Voulez-vous restaurer cette question ?");
    if (!confirmed) return;
    try {
      await QuestionService.restoreQuestion(questionId);
      fetchQuestions();
    } catch (err) {
      notify({ type: 'error', message: 'Erreur lors de la restauration de la question.' });
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    const confirmed = await confirm("Voulez-vous placer cette question dans la corbeille ?");
    if (!confirmed) return;
    try {
      await QuestionService.deleteQuestion(questionId); 
      fetchQuestions(); // Met à jour la liste si succès
    } catch (err) {
      // 🌟 CORRECTION : On affiche le message d'erreur précis renvoyé par Django !
      const errorMsg = err.response?.data?.error || "Erreur lors de la suppression de la question.";
      notify({ type: 'error', message: errorMsg });
    }
  };

  return (
    <div className="lms-scope lms-page">
      <div className="lms-container">
        <div className="lms-pageheader">
          <div>
            <h1 className="lms-pageheader__title">
              {showTrash ? "Banque de questions (Corbeille)" : "Banque de questions"}
            </h1>
            <p className="lms-pageheader__subtitle">
              <span className="lms-num">{data.count}</span> question(s) trouvée(s)
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
              <button className="lms-btn lms-btn--success" onClick={() => navigate('/banque-questions/create')}>
                + Créer une question
              </button>
            )}
          </div>
        </div>

        {/* ZONE DE FILTRES */}
        <div className="lms-filterbar">
          <div className="lms-search">
            <span className="lms-search__icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="7" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </span>
            <input
              type="text"
              className="lms-input"
              placeholder="Rechercher un mot-clé dans l'énoncé…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="lms-filterbar__select">
            <select
              className="lms-select"
              value={typeCode}
              onChange={(e) => setTypeCode(e.target.value)}
            >
              <option value="">Tous les types</option>
              <option value="QCM">QCM (Choix Multiples)</option>
              <option value="QCU">QCU (Choix Unique)</option>
              <option value="OUV">Question Ouverte</option>
            </select>
          </div>
        </div>

        {error && <div className="lms-alert lms-alert--danger" style={{ marginBottom: 'var(--space-5)' }}>{error}</div>}

        {/* AFFICHAGE DES RÉSULTATS */}
        {loading ? (
          <div className="lms-loading"><span className="lms-spinner" />Chargement en cours…</div>
        ) : (
          <div className="lms-stack">
            {data.results.length === 0 && !error ? (
              <div className="lms-empty">
                <p className="lms-empty__title">Aucun résultat</p>
                <p>{showTrash ? "La corbeille est vide." : "Aucune question ne correspond à votre recherche."}</p>
              </div>
            ) : (
              data.results.map((question) => (
                <div key={question.id} className="lms-card" style={{ opacity: showTrash ? 0.8 : 1 }}>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h4 style={{ marginBottom: 'var(--space-4)', fontFamily: 'var(--font-display)', fontSize: 'var(--text-md)' }}>
                      {question.enonce_question}
                    </h4>
                    
                    {showTrash ? (
                      <button 
                        className="lms-btn lms-btn--success lms-btn--sm"
                        onClick={() => handleRestoreQuestion(question.id)}
                      >
                        <IconRestore style={{ marginRight: '6px' }} /> Restaurer
                      </button>
                    ) : (
                      <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                        {/* 🌟 NOUVEAU : Boutons Modifier et Supprimer */}
                        <button 
                          className="lms-icon-action lms-icon-action--neutral"
                          onClick={() => navigate(`/banque-questions/${question.id}/edit`)}
                          title="Modifier cette question"
                        >
                          <IconEdit />
                        </button>
                        
                        <button 
                          className="lms-icon-action"
                          onClick={() => handleDeleteQuestion(question.id)}
                          title="Mettre à la corbeille"
                        >
                          <IconTrash />
                        </button>
                      </div>
                    )}
                  </div>

                  <div>
                    {question.reponses.map((rep) => (
                      <div
                        key={rep.id}
                        className={`lms-answer ${rep.est_correct ? 'lms-answer--correct' : 'lms-answer--incorrect'}`}
                      >
                        {rep.texte} <strong>{rep.est_correct ? '(Vrai)' : '(Faux)'}</strong>
                        {rep.explication && (
                          <div className="lms-answer__explain">Explication : {rep.explication}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* PAGINATION */}
        {data.count > 0 && (
          <div className="lms-pagination">
            <button
              className="lms-btn lms-btn--outline"
              disabled={!data.previous}
              onClick={() => setPage(page - 1)}
            >
              &laquo; Précédent
            </button>
            <span className="lms-pagination__label">Page {page}</span>
            <button
              className="lms-btn lms-btn--outline"
              disabled={!data.next}
              onClick={() => setPage(page + 1)}
            >
              Suivant &raquo;
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionBankPage;