import React, { useState, useEffect } from 'react';
import { QuestionService } from '../api/question.service';
import useDebounce from '../hooks/useDebounce';

const QuestionBankPage = () => {
  // États pour les filtres
  const [searchTerm, setSearchTerm] = useState('');
  const [typeCode, setTypeCode] = useState('');
  const [page, setPage] = useState(1);

  // État pour les données et l'interface
  const [data, setData] = useState({ results: [], count: 0, next: null, previous: null });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
    <div className="container" style={{ marginTop: '30px' }}>
      <h2>Banque de Questions</h2>
      <p style={{ color: '#666', marginBottom: '20px' }}>
        Total : {data.count} question(s) trouvée(s)
      </p>

      {/* ZONE DE FILTRES */}
      <div className="card" style={{ marginBottom: '20px', padding: '15px' }}>
        <div style={{ display: 'flex', gap: '15px' }}>
          <div className="form-group" style={{ flex: 2, marginBottom: 0 }}>
            <input
              type="text"
              className="form-control"
              placeholder="Rechercher un mot-clé dans l'énoncé..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
            <select 
              className="form-control" 
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
      </div>

      {/* GESTION D'ERREUR */}
      {error && <div className="text-danger card" style={{ padding: '15px', marginBottom: '20px' }}>{error}</div>}

      {/* AFFICHAGE DES RÉSULTATS */}
      {loading ? (
        <p>Chargement en cours...</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {data.results.length === 0 && !error ? (
            <p style={{ textAlign: 'center', color: '#999', marginTop: '20px' }}>Aucune question ne correspond à votre recherche.</p>
          ) : (
            data.results.map((question) => (
              <div key={question.id} className="card" style={{ padding: '20px' }}>
                <h4 style={{ marginBottom: '15px' }}>{question.enonce_question}</h4>
                <ul style={{ listStyleType: 'none', padding: 0 }}>
                  {question.reponses.map((rep) => (
                    <li 
                      key={rep.id} 
                      style={{ 
                        padding: '8px', 
                        marginBottom: '5px', 
                        borderRadius: '4px',
                        backgroundColor: rep.est_correct ? '#d4edda' : '#f8d7da',
                        color: rep.est_correct ? '#155724' : '#721c24',
                        border: `1px solid ${rep.est_correct ? '#c3e6cb' : '#f5c6cb'}`
                      }}
                    >
                      {rep.texte} <strong>{rep.est_correct ? '(Vrai)' : '(Faux)'}</strong>
                      {rep.explication && <div style={{ fontSize: '0.85em', marginTop: '4px', fontStyle: 'italic' }}>Explication: {rep.explication}</div>}
                    </li>
                  ))}
                </ul>
              </div>
            ))
          )}
        </div>
      )}

      {/* PAGINATION */}
      {data.count > 0 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', padding: '20px 0' }}>
          <button 
            className="btn" 
            style={{ backgroundColor: data.previous ? '#0056b3' : '#ccc', cursor: data.previous ? 'pointer' : 'not-allowed' }}
            disabled={!data.previous} 
            onClick={() => setPage(page - 1)}
          >
            &laquo; Précédent
          </button>
          
          <span style={{ padding: '10px' }}>Page {page}</span>
          
          <button 
            className="btn" 
            style={{ backgroundColor: data.next ? '#0056b3' : '#ccc', cursor: data.next ? 'pointer' : 'not-allowed' }}
            disabled={!data.next} 
            onClick={() => setPage(page + 1)}
          >
            Suivant &raquo;
          </button>
        </div>
      )}
    </div>
  );
};

export default QuestionBankPage;