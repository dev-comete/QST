import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logoutContext } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutContext();
    navigate('/login');
  };

  return (
    <nav style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: '#0056b3',
      color: 'white',
      padding: '1rem 2rem',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      {/* Logo / Marque */}
      <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
        QST Platform
      </div>

      {/* Liens de navigation */}
      <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
        <Link to="/dashboard" style={linkStyle}>
          Tableau de Bord
        </Link>
        
        {/* On affiche ce lien uniquement si l'utilisateur est formateur ou admin */}
        {(user?.role === 'formateur' || user?.role === 'admin') && (
            <>
                <Link to="/quizzes" style={linkStyle}>
                Mes Quiz
                </Link>
                <Link to="/banque-questions" style={linkStyle}>
                Banque de Questions
                </Link>
            </>
        )}
      </div>

      {/* Section Utilisateur & Déconnexion */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        <span style={{ fontSize: '0.9rem' }}>
          {user?.first_name} {user?.last_name} ({user?.role})
        </span>
        <button 
          onClick={handleLogout} 
          style={{
            background: 'transparent',
            border: '1px solid white',
            color: 'white',
            padding: '5px 15px',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
          onMouseOver={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
          onMouseOut={(e) => e.target.style.background = 'transparent'}
        >
          Déconnexion
        </button>
      </div>
    </nav>
  );
};

// Style réutilisable pour les liens
const linkStyle = {
  color: 'white',
  textDecoration: 'none',
  fontWeight: '500',
  padding: '5px 10px',
  borderRadius: '4px',
  transition: 'background-color 0.2s'
};

export default Navbar;