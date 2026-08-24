import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';
import '../styles/index.css';
import comete from '../assets/comete.jpg';

// 🌟 NOUVEAU : Configuration claire basée sur les rôles
const NAV_LINKS = [
  // Lien Formateur / Admin
  { to: '/dashboard', label: 'Tableau de Bord', showFor: ['formateur', 'admin'] },
  // 🌟 Lien Apprenant
  { to: '/student/dashboard', label: 'Mon Espace', showFor: ['apprenant'] },
  
  // Liens Formateur / Admin
  { to: '/formations', label: 'Formations', showFor: ['formateur', 'admin'] },
  { to: '/quizzes', label: 'Mes Quiz', showFor: ['formateur', 'admin'] },
  { to: '/banque-questions', label: 'Banque de Questions', showFor: ['formateur', 'admin'] },
  { to: '/baremes', label: 'Barèmes', showFor: ['formateur', 'admin'] },
  { to: '/vagues', label: 'Vagues', showFor: ['formateur', 'admin'] },
  
  // Liens strictement Admin
  { to: '/users', label: 'Utilisateurs', showFor: ['admin'] },
  { to: '/organisations', label: 'Organisations', showFor: ['admin'] }
];

const Navbar = () => {
  const { user, logoutContext } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const userRole = user?.role;
  const initials = `${user?.first_name?.[0] || ''}${user?.last_name?.[0] || ''}`.toUpperCase() || (user?.username?.[0]?.toUpperCase() ?? 'U');

  const handleLogout = async () => {
    // 1. On attend que le backend bloque le token et que le state soit nettoyé
    await logoutContext();
    // 2. Seulement après, on redirige l'utilisateur
    navigate('/login');
  };

  // 🌟 NOUVEAU : Lien dynamique pour le logo selon le rôle
  const homeLink = userRole === 'apprenant' ? '/student/dashboard' : '/dashboard';

  return (
    <nav className="lms-scope lms-navbar">
      {/* Logo / Marque */}
      <Link to={homeLink} className="lms-navbar__brand">
        <img 
          src={comete} 
          alt="Logo QST" 
          className="lms-navbar__logo-img" 
        />
        QST Platform
      </Link>

      {/* Liens de navigation */}
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