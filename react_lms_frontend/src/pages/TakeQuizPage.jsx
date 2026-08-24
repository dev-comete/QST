import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { StudentQuizService } from '../api/studentQuiz.service';

// 🌟 CORRECTION 1 : Gère parfaitement le format DRF ("00:30:00", "1 02:30:00", "00:30:00.123")
const parseDurationToMs = (durationStr) => {
  if (!durationStr) return 0;
  let days = 0;
  let timeStr = durationStr;
  
  if (durationStr.includes(' ')) {
    const parts = durationStr.split(' ');
    days = parseInt(parts[0], 10) || 0;
    timeStr = parts[1];
  }
  
  const timeParts = timeStr.split(':');
  if (timeParts.length >= 3) {
    const hours = parseInt(timeParts[0], 10) || 0;
    const minutes = parseInt(timeParts[1], 10) || 0;
    const seconds = parseFloat(timeParts[2]) || 0;
    return (days * 86400 + hours * 3600 + minutes * 60 + seconds) * 1000;
  }
  return 0; // Si le format est inconnu
};

const formatTime = (ms) => {
  if (ms <= 0) return "00:00";
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

export default function TakeQuizPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [quizInfo, setQuizInfo] = useState(null);
  const [questions, setQuestions] = useState([]);
  
  const [answers, setAnswers] = useState({});
  // 🌟 CORRECTION 2 : Un "Ref" pour toujours avoir accès aux dernières réponses dans le chronomètre
  const answersRef = useRef({});
  
  // Met à jour la référence dès que answers change
  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const [timeLeft, setTimeLeft] = useState(null);

  // 1. Chargement des données du Quiz et Chronomètre
  useEffect(() => {
    let timerId; // 🌟 Pour pouvoir arrêter la boucle infinie

    const fetchQuizData = async () => {
      try {
        const data = await StudentQuizService.startQuiz(id);
        setQuizInfo(data);
        setQuestions(data.questions);

        const initialAnswers = {};
        data.questions.forEach(q => {
          initialAnswers[q.question_id] = [];
        });
        setAnswers(initialAnswers);
        answersRef.current = initialAnswers;

        // Calcul du temps sécurisé
        const durationMs = parseDurationToMs(data.quiz_duree);
        
        // Sécurité timezone (ajoute le Z si Django envoie une date naïve pour la forcer en UTC)
        let debutStr = data.heure_debut;
        if (!debutStr.endsWith('Z') && !debutStr.includes('+')) debutStr += 'Z';
        
        const startTimeMs = new Date(debutStr).getTime();
        const endTimeMs = startTimeMs + durationMs;
        
        const updateTimer = () => {
          const now = Date.now();
          const remaining = endTimeMs - now;
          
          if (remaining <= 0) {
            setTimeLeft(0);
            if (timerId) clearInterval(timerId); // 🌟 CORRECTION 3 : STOPPE LA BOUCLE IMMÉDIATEMENT
            forceSubmitTimeout(); // Soumission avec la copie à jour
          } else {
            setTimeLeft(remaining);
          }
        };

        updateTimer();
        timerId = setInterval(updateTimer, 1000);

      } catch (err) {
        setError(err.response?.data?.error || "Erreur lors du chargement du quiz.");
      } finally {
        setLoading(false);
      }
    };

    fetchQuizData();
    
    // Nettoyage au démontage du composant
    return () => {
      if (timerId) clearInterval(timerId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Fonction spéciale de soumission (hors cycle classique) quand le temps est écoulé
  const forceSubmitTimeout = async () => {
    setSubmitting(true);
    try {
      const response = await StudentQuizService.submitQuiz(id, answersRef.current);
      alert(`Temps écoulé ! Quiz soumis automatiquement.\n\nScore : ${response.score_obtenu} points.`);
      navigate('/student/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || "Erreur lors de la soumission automatique.");
      setSubmitting(false);
    }
  };

  // 2. Gestion des clics sur les options
  const handleOptionToggle = (questionId, optionId, typeCode) => {
    setAnswers(prev => {
      const currentSelection = prev[questionId] || [];

      if (typeCode === 'QCU') {
        return { ...prev, [questionId]: [optionId] };
      } else {
        if (currentSelection.includes(optionId)) {
          return { ...prev, [questionId]: currentSelection.filter(id => id !== optionId) };
        } else {
          return { ...prev, [questionId]: [...currentSelection, optionId] };
        }
      }
    });
  };

  // 3. Soumission manuelle (Le bouton classique)
  const handleSubmitManually = async () => {
    if (submitting) return;

    const isConfirmed = window.confirm("Êtes-vous sûr de vouloir soumettre vos réponses ? Cette action est définitive.");
    if (!isConfirmed) return;

    setSubmitting(true);
    try {
      const response = await StudentQuizService.submitQuiz(id, answers);
      alert(`Félicitations, quiz terminé !\n\nScore : ${response.score_obtenu} points.`);
      navigate('/student/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || "Erreur lors de la soumission du quiz.");
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="lms-scope lms-page">
        <div className="lms-container lms-loading">
          <span className="lms-spinner" />
          Préparation de votre évaluation...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="lms-scope lms-page">
        <div className="lms-container">
          <div className="lms-empty">
            <p className="lms-empty__title">Information</p>
            <p>{error}</p>
            <button className="lms-btn lms-btn--primary" onClick={() => navigate('/student/dashboard')} style={{ marginTop: 'var(--space-4)' }}>
              Retour à mon espace
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="lms-scope lms-page">
      <div className="lms-container lms-container--md">
        
        {/* EN-TÊTE FIXE DU QUIZ */}
        <div className="lms-card lms-card--pad-lg" style={{ position: 'sticky', top: '16px', zIndex: 10, marginBottom: 'var(--space-6)', borderTop: '4px solid var(--color-primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p className="lms-eyebrow" style={{ marginBottom: 'var(--space-2)' }}>Évaluation en cours</p>
              <h1 className="lms-card__title" style={{ margin: 0 }}>{quizInfo?.quiz_titre || 'Quiz'}</h1>
            </div>
            
            {/* CHRONOMÈTRE */}
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Temps restant
              </div>
              <div style={{ 
                fontSize: 'var(--text-2xl)', 
                fontWeight: 700, 
                color: timeLeft < 60000 ? 'var(--color-danger)' : 'var(--color-text)', // Rouge à 1 min
                fontVariantNumeric: 'tabular-nums' 
              }}>
                {formatTime(timeLeft)}
              </div>
            </div>
          </div>
        </div>

        {/* LISTE DES QUESTIONS */}
        <div className="lms-stack" style={{ gap: 'var(--space-6)' }}>
          {questions.map((q, index) => {
            const isQCU = q.type_question?.code === 'QCU' || q.type_question === 'QCU';
            
            return (
              <div key={q.question_id} className="lms-card">
                <div className="lms-card__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h3 className="lms-card__title">
                    <span style={{ color: 'var(--color-text-muted)', marginRight: 'var(--space-2)' }}>Q{index + 1}.</span>
                    {q.enonce}
                  </h3>
                </div>
                
                <div className="lms-card__body">
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-4)' }}>
                    {isQCU ? "Sélectionnez une seule réponse." : "Sélectionnez une ou plusieurs réponses."}
                  </p>

                  <div className="lms-stack" style={{ gap: 'var(--space-3)' }}>
                    {q.options.map(opt => (
                      <label 
                        key={opt.id} 
                        style={{ 
                          display: 'flex', 
                          alignItems: 'center',
                          padding: 'var(--space-3)',
                          border: '1px solid var(--color-border)',
                          borderRadius: 'var(--radius-md)',
                          cursor: 'pointer',
                          backgroundColor: answers[q.question_id]?.includes(opt.id) ? 'var(--color-surface-hover)' : 'transparent',
                          transition: 'background-color 0.2s'
                        }}
                      >
                        <input 
                          type={isQCU ? "radio" : "checkbox"} 
                          name={`question_${q.question_id}`}
                          checked={answers[q.question_id]?.includes(opt.id) || false}
                          onChange={() => handleOptionToggle(q.question_id, opt.id, isQCU ? 'QCU' : 'QCM')}
                          style={{ marginRight: 'var(--space-3)', width: '18px', height: '18px' }}
                        />
                        <span style={{ flex: 1 }}>{opt.reponse}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* BOUTON SOUMETTRE MANUEL */}
        <div style={{ marginTop: 'var(--space-8)', textAlign: 'right' }}>
          <button 
            className="lms-btn lms-btn--primary lms-btn--lg" 
            onClick={handleSubmitManually}
            disabled={submitting}
          >
            {submitting ? 'Envoi en cours...' : 'Soumettre mon évaluation'}
          </button>
        </div>

      </div>
    </div>
  );
}