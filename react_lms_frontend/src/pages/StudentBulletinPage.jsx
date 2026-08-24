import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { StudentQuizService } from '../api/studentQuiz.service';
import '../styles/index.css';

export default function StudentBulletinPage() {
  const { id } = useParams(); // L'ID de la vague
  const [bulletin, setBulletin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBulletin = async () => {
      try {
        const data = await StudentQuizService.getBulletin(id);
        setBulletin(data);
      } catch (err) {
        setError(err.response?.data?.error || "Erreur lors du chargement de votre bulletin.");
      } finally {
        setLoading(false);
      }
    };
    fetchBulletin();
  }, [id]);

  if (loading) return <div className="lms-container lms-loading"><span className="lms-spinner" /> Génération du bulletin...</div>;
  if (error) return <div className="lms-container"><div className="lms-alert lms-alert--danger">{error}</div></div>;

  const resume = bulletin.resume_global;

  return (
    <div className="lms-scope lms-page">
      <div className="lms-container lms-container--md">
        
        <Link to="/student/dashboard" className="lms-btn lms-btn--outline" style={{ marginBottom: 'var(--space-5)' }}>
          ← Retour à mon espace
        </Link>

        {/* EN-TÊTE DU BULLETIN */}
        <div className="lms-card lms-card--pad-lg" style={{ marginBottom: 'var(--space-6)', borderTop: '4px solid var(--color-primary)' }}>
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-5)' }}>
            <p className="lms-eyebrow">Bulletin de Notes Officiel</p>
            <h1 className="lms-pageheader__title" style={{ margin: 'var(--space-2) 0' }}>{bulletin.vague.formation}</h1>
            <p style={{ color: 'var(--color-text-muted)' }}>Apprenant : <strong>{bulletin.apprenant.prenom} {bulletin.apprenant.nom}</strong></p>
          </div>

          <div className="lms-grid lms-grid--3" style={{ textAlign: 'center', backgroundColor: 'var(--color-surface-hover)', borderRadius: 'var(--radius-md)', padding: 'var(--space-4)' }}>
            <div>
              <div style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>Moyenne Générale</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: resume.moyenne_generale_pct >= 50 ? 'var(--color-success)' : 'var(--color-danger)' }}>
                {resume.moyenne_generale_pct}%
              </div>
            </div>
            <div>
              <div style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>Score Total</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                {resume.total_score_obtenu} <span style={{ fontSize: '1rem', fontWeight: 'normal', color: 'var(--color-text-muted)' }}>/ {resume.total_score_possible}</span>
              </div>
            </div>
            <div>
              <div style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>Progression</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>
                {resume.progression}
              </div>
            </div>
          </div>
        </div>

        {/* DÉTAIL DES NOTES */}
        <div className="lms-card">
          <div className="lms-card__header">
            <h3 className="lms-card__title">Détail des évaluations</h3>
          </div>
          <div className="lms-card__body" style={{ padding: 0 }}>
            <table className="lms-table">
              <thead>
                <tr>
                  <th>Évaluation</th>
                  <th>Statut</th>
                  <th style={{ textAlign: 'right' }}>Note</th>
                  <th style={{ textAlign: 'right' }}>Pourcentage</th>
                </tr>
              </thead>
              <tbody>
                {bulletin.details_quizzes.map((quiz) => (
                  <tr key={quiz.quiz_id}>
                    <td className="lms-table__name">Quiz #{quiz.quiz_id}</td>
                    <td>
                      <span style={{ 
                        fontSize: 'var(--text-xs)', padding: '2px 8px', borderRadius: '12px', fontWeight: 600,
                        backgroundColor: quiz.statut === 'Terminé' ? 'rgba(16, 185, 129, 0.1)' : 'var(--color-surface-hover)',
                        color: quiz.statut === 'Terminé' ? 'var(--color-success)' : 'var(--color-text-muted)'
                      }}>
                        {quiz.statut}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {quiz.statut === 'Terminé' ? <strong>{quiz.score_obtenu} / {quiz.score_maximum}</strong> : '-'}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 'bold', color: quiz.pourcentage >= 50 ? 'var(--color-success)' : (quiz.statut === 'Terminé' ? 'var(--color-danger)' : 'inherit') }}>
                      {quiz.statut === 'Terminé' ? `${quiz.pourcentage}%` : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}