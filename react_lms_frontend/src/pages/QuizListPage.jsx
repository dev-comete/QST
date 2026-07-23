import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // <-- 1. Import de useNavigate
import { QuizService } from '../api/quiz.service';

const QuizListPage = () => {
  const navigate = useNavigate(); // <-- 2. Initialisation
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
    <div className="container" style={{ marginTop: '30px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Gestion des Quiz</h2>
        <button 
          className="btn" 
          style={{ backgroundColor: '#28a745' }}
          onClick={() => navigate('/quizzes/create')} // <-- 3. Ajout de l'action de redirection
        >
          + Créer un nouveau Quiz
        </button>
      </div>

      {error && <div className="text-danger card" style={{ padding: '15px', marginBottom: '20px' }}>{error}</div>}

      {loading ? (
        <p>Chargement des quiz...</p>
      ) : quizzes.length === 0 ? (
        <div className="card" style={{ padding: '30px', textAlign: 'center', color: '#666' }}>
          <p>Vous n'avez pas encore créé de quiz.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {quizzes.map((quiz) => (
            <div key={quiz.id} className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                {/* 4. Mise à jour avec les vrais champs JSON */}
                <h4 style={{ marginBottom: '10px' }}>Quiz #{quiz.id}</h4>
                
                <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '5px' }}>
                  Statut : <strong style={{ color: quiz.status === 'published' ? '#28a745' : '#ffc107' }}>
                    {quiz.status === 'published' ? 'Publié' : 'Brouillon'}
                  </strong>
                </p>
                
                <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '5px' }}>
                  Formation ID : <strong>{quiz.formation}</strong>
                </p>

                <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '5px' }}>
                  Durée : <strong>{quiz.duree}</strong>
                </p>

                <p style={{ color: '#aaa', fontSize: '0.8rem', marginTop: '10px' }}>
                  Créé le : {formatDate(quiz.date_creation_quiz)}
                </p>
              </div>
              
                <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                <button className="btn" style={{ flex: 1, backgroundColor: '#17a2b8', padding: '5px' }}>Paramètres</button>
                
                {/* Mise à jour du bouton Questions ici */}
                <button 
                    className="btn" 
                    style={{ flex: 1, backgroundColor: '#6c757d', padding: '5px' }}
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
  );
};

export default QuizListPage;