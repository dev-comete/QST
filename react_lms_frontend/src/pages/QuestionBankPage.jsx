import React, { useState, useEffect } from 'react';
import { QuestionService } from '../api/question.service';
import useDebounce from '../hooks/useDebounce';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/index.css';

const QuestionBankPage = () => {
  // États pour les filtres
  const [searchTerm, setSearchTerm] = useState('');
  const [typeCode, setTypeCode] = useState('');
  const [page, setPage] = useState(1);

  // État pour les données et l'interface
  const [data, setData] = useState({ results: [], count: 0, next: null, previous: null });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  // Utilisation du hook debounce (attendre 500ms après la dernière frappe)
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Effet pour recharger les données si un filtre ou la page change
  useEffect(() => {
    fetchQuestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchTerm, typeCode, page]);

  // Si on change la recherche ou le type, on retourne à la page 1
  useEffect(() => {
    setPage(1);
  }, [debouncedSearchTerm, typeCode]);

  const fetchQuestions = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await QuestionService.getBankQuestions(debouncedSearchTerm, typeCode, page);
      setData(response);
    } catch (err) {
      setError("Impossible de charger les questions. Vérifiez votre connexion.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lms-scope lms-page">
      <div className="lms-container">
        <div className="lms-pageheader">
          <div>
            <h1 className="lms-pageheader__title">Banque de questions</h1>
            <p className="lms-pageheader__subtitle">
              <span className="lms-num">{data.count}</span> question(s) trouvée(s)
            </p>
          </div>
          <button className="lms-btn lms-btn--success" onClick={() => navigate('/banque-questions/create')}>
            + Créer une question
          </button>
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

        {/* GESTION D'ERREUR */}
        {error && <div className="lms-alert lms-alert--danger" style={{ marginBottom: 'var(--space-5)' }}>{error}</div>}

        {/* AFFICHAGE DES RÉSULTATS */}
        {loading ? (
          <div className="lms-loading"><span className="lms-spinner" />Chargement en cours…</div>
        ) : (
          <div className="lms-stack">
            {data.results.length === 0 && !error ? (
              <div className="lms-empty">
                <p className="lms-empty__title">Aucun résultat</p>
                <p>Aucune question ne correspond à votre recherche.</p>
              </div>
            ) : (
              data.results.map((question) => (
                <div key={question.id} className="lms-card">
                  <h4 style={{ marginBottom: 'var(--space-4)', fontFamily: 'var(--font-display)', fontSize: 'var(--text-md)' }}>
                    {question.enonce_question}
                  </h4>
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
