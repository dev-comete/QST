import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { VagueService } from '../api/vague.service';
import '../styles/index.css';

export default function VagueAnalyticsPage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const result = await VagueService.getAnalytics(id);
        setData(result);
      } catch (err) {
        setError("Erreur lors du chargement des statistiques.");
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [id]);

  if (loading) return <div className="lms-container lms-loading"><span className="lms-spinner" /> Chargement des statistiques...</div>;
  if (error) return <div className="lms-container"><div className="lms-alert lms-alert--danger">{error}</div></div>;

  // Cas où la vague est vide
  if (data.message) {
    return (
      <div className="lms-scope lms-page">
        <div className="lms-container">
          <Link to={`/vagues/${id}`} className="lms-btn lms-btn--outline" style={{ marginBottom: 'var(--space-4)' }}>Retour à la vague</Link>
          <div className="lms-empty">
            <p className="lms-empty__title">Aucune donnée</p>
            <p>{data.message}</p>
          </div>
        </div>
      </div>
    );
  }

  const global = data.statistiques_globales;

  return (
    <div className="lms-scope lms-page">
      <div className="lms-container">
        
        {/* EN-TÊTE */}
        <div className="lms-header-row" style={{ marginBottom: 'var(--space-6)' }}>
          <div>
            <p className="lms-eyebrow" style={{ marginBottom: 'var(--space-2)' }}>Statistiques de la Session</p>
            <h1 className="lms-pageheader__title">{data.vague.formation}</h1>
            <p className="lms-pageheader__subtitle">{data.vague.total_inscrits} apprenant(s) inscrit(s)</p>
          </div>
          <Link to={`/vagues/${id}`} className="lms-btn lms-btn--outline">Gérer la vague</Link>
        </div>

        {/* KPIs GLOBAUX */}
        <div className="lms-grid lms-grid--3" style={{ marginBottom: 'var(--space-6)' }}>
          <div className="lms-card lms-card--pad-lg" style={{ textAlign: 'center', borderTop: '4px solid var(--color-primary)' }}>
            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-2)' }}>Moyenne de la Classe</div>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--color-primary)' }}>{global.moyenne_globale_classe} <span style={{ fontSize: '1rem' }}>/ {global.points_totaux_possibles}</span></div>
          </div>
          <div className="lms-card lms-card--pad-lg" style={{ textAlign: 'center', borderTop: '4px solid var(--color-success)' }}>
            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-2)' }}>Taux de Réussite Global</div>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--color-success)' }}>{global.taux_reussite_global_pct}%</div>
          </div>
          <div className="lms-card lms-card--pad-lg" style={{ borderTop: '4px solid var(--color-warning)' }}>
             <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-2)' }}>Top 3 de la Promo</div>
             <ul style={{ paddingLeft: '1.2rem', margin: 0, fontSize: 'var(--text-sm)' }}>
                {global.majors_de_promo_top3.length === 0 ? <li>Aucun résultat</li> : 
                 global.majors_de_promo_top3.map((m, i) => (
                   <li key={i}><strong>{m.utilisateur__username}</strong> ({m.score_cumule} pts)</li>
                 ))}
             </ul>
          </div>
        </div>

        {/* STATISTIQUES PAR QUIZ */}
        <h2 className="lms-card__title" style={{ marginBottom: 'var(--space-4)' }}>Détails par Quiz</h2>
        <div className="lms-stack" style={{ gap: 'var(--space-4)' }}>
          {data.statistiques_par_quiz.map((q) => (
            <div key={q.quiz_id} className="lms-card lms-card--pad-lg">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
                <h3 className="lms-card__title" style={{ margin: 0 }}>Quiz #{q.quiz_id}</h3>
                <span className="lms-badge" style={{ backgroundColor: 'var(--color-surface-hover)', padding: '4px 12px', borderRadius: '12px' }}>
                  Participation : {q.taux_participation_pct}%
                </span>
              </div>
              
              <div className="lms-grid lms-grid--3" style={{ gap: 'var(--space-4)', fontSize: 'var(--text-sm)' }}>
                <div>
                  <strong>Moyenne :</strong> {q.moyenne_classe} / {q.points_maximum} pts<br/>
                  <strong>Réussite :</strong> <span style={{ color: q.taux_reussite_pct > 50 ? 'var(--color-success)' : 'var(--color-danger)' }}>{q.taux_reussite_pct}%</span>
                </div>
                
                {q.alerte_question_difficile && (
                  <div style={{ gridColumn: 'span 2', padding: 'var(--space-3)', backgroundColor: 'rgba(239, 68, 68, 0.05)', borderLeft: '4px solid var(--color-danger)', borderRadius: 'var(--radius-md)' }}>
                    <strong style={{ color: 'var(--color-danger)' }}>⚠️ Question la plus échouée ({q.nombre_echecs_question} échecs) :</strong><br/>
                    {q.alerte_question_difficile}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}