import React, { useState, useEffect } from 'react';
import { QuestionService } from '../api/question.service';
import useDebounce from '../hooks/useDebounce';
import { useNavigate } from 'react-router-dom';
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

const QuestionBankPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeCode, setTypeCode] = useState('');
  const [page, setPage] = useState(1);

  const [data, setData] = useState({ results: [], count: 0, next: null, previous: null });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // 🌟 ÉTAT MODE CORBEILLE
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
      // 🌟 REQUÊTE DYNAMIQUE SELON LE MODE
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

  // 🌟 FONCTION DE RESTAURATION
  const handleRestoreQuestion = async (questionId) => {
    if (!window.confirm("Voulez-vous restaurer cette question ?")) return;
    try {
      await QuestionService.restoreQuestion(questionId);
      // Rafraîchir la liste après restauration
      fetchQuestions();
    } catch (err) {
      alert("Erreur lors de la restauration de la question.");
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
                    
                    {/* 🌟 BOUTON RESTAURER EN MODE CORBEILLE */}
                    {showTrash && (
                      <button 
                        className="lms-btn lms-btn--success lms-btn--sm"
                        onClick={() => handleRestoreQuestion(question.id)}
                      >
                        <IconRestore style={{ marginRight: '6px' }} /> Restaurer
                      </button>
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