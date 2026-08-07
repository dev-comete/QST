import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../styles/index.css';

const DashboardPage = () => {
  const { user, logoutContext } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutContext();
    navigate('/login');
  };

  const initials = `${user?.first_name?.[0] || ''}${user?.last_name?.[0] || ''}`.toUpperCase() || (user?.username?.[0]?.toUpperCase() ?? 'U');

  return (
    <div className="lms-scope lms-page lms-page--narrow">
      <div className="lms-container--md" style={{ width: '100%' }}>
        <div className="lms-card lms-card--pad-lg">
          <div className="lms-header-row" style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: 'var(--space-4)', marginBottom: 'var(--space-5)' }}>
            <h2>Tableau de bord</h2>
            <button onClick={handleLogout} className="lms-btn lms-btn--ghost" style={{ border: '1px solid var(--color-border-strong)' }}>
              Se déconnecter
            </button>
          </div>

          <div className="lms-header-row" style={{ marginBottom: 'var(--space-5)' }}>
            <div>
              <p className="lms-eyebrow">Bienvenue</p>
              <h3 style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-lg)', fontWeight: 700 }}>
                {user?.first_name} {user?.last_name}
              </h3>
            </div>
            <div className="lms-avatar-ring">{initials}</div>
          </div>

          <p style={{ color: 'var(--color-slate)', marginBottom: 'var(--space-4)' }}>
            Voici les informations associées à votre profil :
          </p>

          <div className="lms-card" style={{ background: 'var(--color-mist)', border: 'none', boxShadow: 'none' }}>
            <div className="lms-summary-row">
              <span className="lms-summary-row__label">ID utilisateur</span>
              <span className="lms-summary-row__value">{user?.id}</span>
            </div>
            <div className="lms-summary-row">
              <span className="lms-summary-row__label">Nom d'utilisateur</span>
              <span className="lms-summary-row__value">{user?.username}</span>
            </div>
            <div className="lms-summary-row">
              <span className="lms-summary-row__label">Email</span>
              <span className="lms-summary-row__value">{user?.email}</span>
            </div>
            <div className="lms-summary-row">
              <span className="lms-summary-row__label">Rôle</span>
              <span className="lms-role-chip">{user?.role || 'Utilisateur standard'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
