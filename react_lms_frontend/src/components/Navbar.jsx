import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';
import '../styles/index.css';
import comete from '../assets/comete.jpg';

const NAV_LINKS = [
  { to: '/dashboard', label: 'Tableau de Bord', rolesOnly: false },
  { to: '/formations', label: 'Formations', rolesOnly: true },
  { to: '/quizzes', label: 'Mes Quiz', rolesOnly: true },
  { to: '/banque-questions', label: 'Banque de Questions', rolesOnly: true },
  { to: '/baremes', label: 'Barèmes', rolesOnly: true },
  { to: '/vagues', label: 'Vagues', rolesOnly: true },
  { to: '/users', label: 'Utilisateurs', rolesOnly: true },
  { to: '/organisations', label: 'Organisations', rolesOnly: true }
];

const Navbar = () => {
  const { user, logoutContext } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const canManage = user?.role === 'formateur' || user?.role === 'admin';
  const initials = `${user?.first_name?.[0] || ''}${user?.last_name?.[0] || ''}`.toUpperCase() || (user?.username?.[0]?.toUpperCase() ?? 'U');

  const handleLogout = async () => {
    // 1. On attend que le backend bloque le token et que le state soit nettoyé
    await logoutContext();
    // 2. Seulement après, on redirige l'utilisateur
    navigate('/login');
  };

  return (
    <nav className="lms-scope lms-navbar">
      {/* Logo / Marque */}
      <Link to="/dashboard" className="lms-navbar__brand">
        <img 
          src={comete} 
          alt="Logo QST" 
          className="lms-navbar__logo-img" 
        />
        QST Platform
      </Link>

      {/* Liens de navigation */}
      <div className="lms-navbar__links">
        {NAV_LINKS.filter(link => !link.rolesOnly || canManage).map(link => (
          <Link
            key={link.to}
            to={link.to}
            className={`lms-navbar__link ${location.pathname.startsWith(link.to) ? 'lms-navbar__link--active' : ''}`}
          >
            {link.label}
          </Link>
        ))}
      </div>

      {/* Section Utilisateur & Déconnexion */}
      <div className="lms-navbar__user">
        <div className="lms-navbar__identity">
          <span className="lms-navbar__avatar">{initials}</span>
          <span className="lms-navbar__name">
            {user?.first_name} {user?.last_name}
            <span className="lms-navbar__role">{user?.role}</span>
          </span>
        </div>
        <button onClick={handleLogout} className="lms-navbar__logout">
          Déconnexion
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
