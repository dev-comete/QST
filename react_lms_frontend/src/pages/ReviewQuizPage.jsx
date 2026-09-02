import React, { useState, useEffect } from 'react';
// 🌟 1. On importe useSearchParams
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { StudentQuizService } from '../api/studentQuiz.service';

export default function ReviewQuizPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  // 🌟 2. On récupère la vagueId depuis l'URL
  const [searchParams] = useSearchParams();
  const vagueId = searchParams.get('vague_id');

  const [reviewData, setReviewData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // 🌟 Sécurité : on vérifie que la vague_id est bien présente
    if (!vagueId) {
      setError("Erreur : La session de formation (vague) est introuvable. Impossible de charger la correction.");
      setLoading(false);
      return;
    }

    const fetchReviewData = async () => {
      try {
        // 🌟 3. On passe l'id ET la vagueId au service API
        const data = await StudentQuizService.reviewQuiz(id, vagueId);
        setReviewData(data);
      } catch (err) {
        setError(err.response?.data?.error || "Impossible de charger la correction de ce quiz.");
      } finally {
        setLoading(false);
      }
    };

    fetchReviewData();
  }, [id, vagueId]); // 🌟 4. On ajoute vagueId aux dépendances du useEffect

  if (loading) {
    return (
      <div className="lms-scope lms-page">
        <div className="lms-container lms-loading">
          <span className="lms-spinner" />
          Chargement de votre copie...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="lms-scope lms-page">
        <div className="lms-container">
          <div className="lms-empty">
            <p className="lms-empty__title">Accès refusé</p>
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
        
        {/* EN-TÊTE DES RÉSULTATS */}
        <div className="lms-card lms-card--pad-lg" style={{ marginBottom: 'var(--space-6)', textAlign: 'center', borderTop: '4px solid var(--color-success)' }}>
          <p className="lms-eyebrow" style={{ marginBottom: 'var(--space-2)' }}>Résultats du Quiz</p>
          <h1 className="lms-pageheader__title" style={{ marginBottom: 'var(--space-4)' }}>Correction détaillée</h1>
          
          <div style={{ display: 'inline-block', padding: 'var(--space-4) var(--space-6)', backgroundColor: 'var(--color-surface-hover)', borderRadius: 'var(--radius-lg)' }}>
            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Score Final</div>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--color-success)' }}>
              {reviewData.score_final} <span style={{ fontSize: '1.25rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>pts</span>
            </div>
          </div>
        </div>

        {/* LISTE DES CORRECTIONS */}
        <div className="lms-stack" style={{ gap: 'var(--space-6)' }}>
          {reviewData.corrections.map((correction, index) => {
            return (
              <div key={correction.question_id} className="lms-card" style={{ borderLeft: correction.vrai_ou_faux ? '4px solid var(--color-success)' : '4px solid var(--color-danger)' }}>
                
                {/* EN-TÊTE DE LA QUESTION */}
                <div className="lms-card__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h3 className="lms-card__title">
                    <span style={{ color: 'var(--color-text-muted)', marginRight: 'var(--space-2)' }}>Q{index + 1}.</span>
                    {correction.enonce}
                  </h3>
                  <div style={{ 
                    padding: 'var(--space-1) var(--space-3)', 
                    borderRadius: 'var(--radius-full)', 
                    fontSize: 'var(--text-xs)', 
                    fontWeight: 600,
                    backgroundColor: correction.vrai_ou_faux ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    color: correction.vrai_ou_faux ? 'var(--color-success)' : 'var(--color-danger)'
                  }}>
                    {correction.points_obtenus} pts obtenus
                  </div>
                </div>
                
                <div className="lms-card__body">
                  <div className="lms-stack" style={{ gap: 'var(--space-3)' }}>
                    
                    {/* LES OPTIONS */}
                    {correction.options.map(opt => {
                      // Logique de couleur et d'affichage
                      let bgColor = 'transparent';
                      let borderColor = 'var(--color-border)';
                      let icon = '⬜'; // Case vide par défaut

                      if (opt.choisi_par_apprenant && opt.est_correct) {
                        bgColor = 'rgba(16, 185, 129, 0.05)';
                        borderColor = 'var(--color-success)';
                        icon = '✅'; // Bonne réponse cochée
                      } else if (opt.choisi_par_apprenant && !opt.est_correct) {
                        bgColor = 'rgba(239, 68, 68, 0.05)';
                        borderColor = 'var(--color-danger)';
                        icon = '❌'; // Mauvaise réponse cochée
                      } else if (!opt.choisi_par_apprenant && opt.est_correct) {
                        bgColor = 'rgba(16, 185, 129, 0.02)';
                        borderColor = 'var(--color-success)';
                        icon = '🟩'; // Bonne réponse oubliée (non cochée)
                      }

                      return (
                        <div key={opt.reponse_id} className="lms-stack" style={{ gap: 'var(--space-2)' }}>
                          
                          {/* L'OPTION EN ELLE-MÊME */}
                          <div style={{ 
                            display: 'flex', 
                            alignItems: 'center',
                            padding: 'var(--space-3)',
                            border: `1px solid ${borderColor}`,
                            borderRadius: 'var(--radius-md)',
                            backgroundColor: bgColor
                          }}>
                            <span style={{ marginRight: 'var(--space-3)', fontSize: '1.2rem' }}>{icon}</span>
                            <span style={{ flex: 1, fontWeight: (opt.choisi_par_apprenant || opt.est_correct) ? 500 : 400 }}>
                              {opt.texte}
                            </span>
                          </div>

                          {/* EXPLICATION (Si elle existe et que l'option était pertinente) */}
                          {opt.explication && (opt.choisi_par_apprenant || opt.est_correct) && (
                            <div style={{ 
                              marginLeft: 'calc(1.2rem + var(--space-3))', 
                              padding: 'var(--space-3)', 
                              backgroundColor: 'var(--color-surface-hover)', 
                              borderRadius: 'var(--radius-sm)',
                              fontSize: 'var(--text-sm)',
                              color: 'var(--color-text-muted)'
                            }}>
                              <strong>Explication :</strong> {opt.explication}
                            </div>
                          )}
                        </div>
                      );
                    })}

                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: 'var(--space-8)', textAlign: 'center' }}>
          <button className="lms-btn lms-btn--outline lms-btn--lg" onClick={() => navigate('/student/dashboard')}>
            Retour à mon espace
          </button>
        </div>

      </div>
    </div>
  );
}