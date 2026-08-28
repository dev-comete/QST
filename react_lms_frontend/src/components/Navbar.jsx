import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';
import '../styles/index.css';
import comete from '../assets/comete.jpg';

const UserProfilePanel = () => {
  const { user } = useAuth();
  const initials = `${user?.first_name?.[0] || ''}${user?.last_name?.[0] || ''}`.toUpperCase() || (user?.username?.[0]?.toUpperCase() ?? 'U');

  return (
    <div className="lms-card lms-card--pad-lg lms-navbar__profile-panel">
      <div className="lms-header-row" style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: 'var(--space-4)', marginBottom: 'var(--space-5)' }}>
        <h2>Profil utilisateur</h2>
      </div>

      <div className="lms-header-row" style={{ marginBottom: 'var(--space-5)' }}>
        <div>
          <p className="lms-eyebrow">Compte</p>
          <h3 style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-lg)', fontWeight: 700 }}>
            {user?.first_name} {user?.last_name}
          </h3>
        </div>
        <div className="lms-avatar-ring">{initials}</div>
      </div>

      <p style={{ color: 'var(--color-slate)', marginBottom: 'var(--space-4)' }}>
        Informations associées à votre compte utilisateur.
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
  );
};

const NAV_LINKS = [
  { to: '/dashboard', label: 'Tableau de bord', showFor: ['formateur', 'admin'] },
  { to: '/student/dashboard', label: 'Mon Espace', showFor: ['apprenant'] },
  { to: '/formations', label: 'Formations', showFor: ['formateur', 'admin'] },
  { to: '/quizzes', label: 'Mes Quiz', showFor: ['formateur', 'admin'] },
  { to: '/banque-questions', label: 'Banque de Questions', showFor: ['formateur', 'admin'] },
  { to: '/baremes', label: 'Barèmes', showFor: ['formateur', 'admin'] },
  { to: '/vagues', label: 'Vagues', showFor: ['formateur', 'admin'] },
  { to: '/users', label: 'Utilisateurs', showFor: ['admin'] },
  { to: '/organisations', label: 'Organisations', showFor: ['admin'] }
];

const Navbar = () => {
  const { user, logoutContext } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [activePanel, setActivePanel] = useState('profile');

  const userRole = user?.role;
  const initials = `${user?.first_name?.[0] || ''}${user?.last_name?.[0] || ''}`.toUpperCase() || (user?.username?.[0]?.toUpperCase() ?? 'U');

  const handleLogout = async () => {
    await logoutContext();
    navigate('/login');
  };

  const homeLink = userRole === 'apprenant' ? '/student/dashboard' : '/dashboard';

  return (
    <nav className="lms-scope lms-navbar">
      <Link to={homeLink} className="lms-navbar__brand">
        <img 
          src={comete} 
          alt="Logo QST" 
          className="lms-navbar__logo-img" 
        />
        QST Platform
      </Link>

      <div className="lms-navbar__links">
        {NAV_LINKS.filter(link => link.showFor.includes(userRole)).map(link => (
          <Link
            key={link.to}
            to={link.to}
            className={`lms-navbar__link ${location.pathname.startsWith(link.to) ? 'lms-navbar__link--active' : ''}`}
          >
            {link.label}
          </Link>
        ))}
      </div>

      <div className="lms-navbar__user">
        <button
          type="button"
          className="lms-navbar__user-button"
          onClick={() => setUserMenuOpen(prev => !prev)}
        >
          <span className="lms-navbar__avatar">{initials}</span>
          <span className="lms-navbar__name">
            {user?.first_name} {user?.last_name}
            <span className="lms-navbar__role">{user?.role}</span>
          </span>
        </button>

        {userMenuOpen && (
          <div className="lms-navbar__menu">
            <div className="lms-navbar__menu-tabs">
              <button
                type="button"
                className={`lms-navbar__menu-tab ${activePanel === 'profile' ? 'lms-navbar__menu-tab--active' : ''}`}
                onClick={() => setActivePanel('profile')}
              >
                Profil utilisateur
              </button>
              <button
                type="button"
                className={`lms-navbar__menu-tab ${activePanel === 'settings' ? 'lms-navbar__menu-tab--active' : ''}`}
                onClick={() => setActivePanel('settings')}
              >
                Paramètres
              </button>
            </div>

            {activePanel === 'profile' ? (
              <UserProfilePanel />
            ) : (
              <div className="lms-card lms-card--pad-lg lms-navbar__settings-panel">
                <h3 style={{ marginBottom: 'var(--space-4)' }}>Paramètres utilisateur</h3>
                <div className="lms-summary-row">
                  <span className="lms-summary-row__label">Langue</span>
                  <span className="lms-summary-row__value">Français</span>
                </div>
                <div className="lms-summary-row">
                  <span className="lms-summary-row__label">Notifications</span>
                  <span className="lms-summary-row__value">Activées</span>
                </div>
                <div className="lms-summary-row">
                  <span className="lms-summary-row__label">Thème</span>
                  <span className="lms-summary-row__value">Clair</span>
                </div>
              </div>
            )}
          </div>
        )}

        <button onClick={handleLogout} className="lms-navbar__logout">
          Déconnexion
        </button>
      </div>
    </nav>
  );
};

export default Navbar;