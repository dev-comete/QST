import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { DashboardService } from '../api/dashboard.service';
import '../styles/index.css';

const DashboardPage = () => {
  const { user } = useAuth();
  
  const [metrics, setMetrics] = useState({
    stats: [],
    recentQuizzes: [],
    upcomingSessions: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const data = await DashboardService.getMetrics();
        setMetrics(data);
      } catch (error) {
        console.error("Erreur lors du chargement des métriques du dashboard", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  if (loading) {
    return (
      <div className="lms-scope lms-page">
        <div className="lms-container lms-loading">
          <span className="lms-spinner" />
          Chargement du tableau de bord...
        </div>
      </div>
    );
  }

  return (
    <div className="lms-scope lms-page">
      <div className="lms-container" style={{ maxWidth: '1180px' }}>
        <div className="lms-pageheader">
          <div>
            <h1 className="lms-pageheader__title">Tableau de bord</h1>
            <p className="lms-pageheader__subtitle">Vue d’ensemble des formations, quiz et performances.</p>
          </div>
          <div className="lms-role-chip">{user?.role || 'Formateur'}</div>
        </div>

        {/* --- KPIs --- */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
          {metrics.stats.map((stat) => (
            <div key={stat.label} className="lms-card lms-card--tab" style={{ borderLeftColor: stat.tone === 'harbor' ? 'var(--color-harbor)' : stat.tone === 'success' ? 'var(--color-success)' : stat.tone === 'info' ? 'var(--color-info)' : 'var(--color-warning)' }}>
              <div className="lms-card__header" style={{ marginBottom: 'var(--space-3)' }}>
                <span className="lms-card__title" style={{ fontSize: 'var(--text-sm)', color: 'var(--color-slate)' }}>{stat.label}</span>
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-ink)', lineHeight: 1.1 }}>{stat.value}</div>
              <div className="lms-card__hint" style={{ marginTop: 'var(--space-2)', marginBottom: 0 }}>{stat.change}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 'var(--space-5)' }}>
          
          {/* --- QUIZ RÉCENTS --- */}
          <div className="lms-card lms-card--pad-lg">
            <div className="lms-card__header">
              <div>
                <div className="lms-eyebrow">Suivi</div>
                <h3 className="lms-card__title">Quiz récents</h3>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {metrics.recentQuizzes.length === 0 ? (
                <p style={{ color: 'var(--color-slate)', fontSize: 'var(--text-sm)' }}>Aucun quiz publié récemment.</p>
              ) : (
                metrics.recentQuizzes.map((quiz, index) => (
                  <div key={index} style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: 'var(--space-3) var(--space-4)', background: 'var(--color-mist)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-2)' }}>
                      <strong style={{ fontSize: 'var(--text-sm)' }}>{quiz.name}</strong>
                      <span className="lms-badge lms-badge--neutral">{quiz.status}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                      <div style={{ flex: 1, height: '8px', background: 'var(--color-border)', borderRadius: '999px', overflow: 'hidden' }}>
                        <div style={{ width: quiz.completion, height: '100%', background: 'var(--color-harbor)', borderRadius: '999px' }} />
                      </div>
                      <span style={{ fontWeight: 600, color: 'var(--color-slate)', minWidth: '52px', textAlign: 'right' }}>{quiz.completion}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* --- PROCHAINES SESSIONS --- */}
          <div className="lms-card lms-card--pad-lg">
            <div className="lms-card__header">
              <div>
                <div className="lms-eyebrow">Planning</div>
                <h3 className="lms-card__title">Prochaines sessions</h3>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {metrics.upcomingSessions.length === 0 ? (
                <p style={{ color: 'var(--color-slate)', fontSize: 'var(--text-sm)' }}>Aucune session planifiée à venir.</p>
              ) : (
                metrics.upcomingSessions.map((session, index) => (
                  <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--space-3)', borderBottom: '1px solid var(--color-border)', paddingBottom: 'var(--space-2)' }}>
                    <div>
                      <div style={{ fontWeight: 600 }}>{session.name}</div>
                      <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-slate)' }}>{session.date}</div>
                    </div>
                    <span className="lms-badge lms-badge--harbor">Planifié</span>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default DashboardPage;