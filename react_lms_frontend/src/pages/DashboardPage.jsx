import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const DashboardPage = () => {
  const { user, logoutContext } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutContext();
    navigate('/login');
  };

  return (
    <div className="container" style={{ marginTop: '5vh' }}>
      <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: '1rem', marginBottom: '1rem' }}>
          <h2>Tableau de Bord</h2>
          <button onClick={handleLogout} className="btn" style={{ background: '#dc3545' }}>Déconnexion</button>
        </div>
        
        <div>
          <h3>Bienvenue, {user?.first_name} {user?.last_name}!</h3>
          <p style={{ marginTop: '1rem', color: '#666' }}>Voici les informations associées à votre profil :</p>
          
          <div style={{ background: '#f8f9fa', padding: '1.5rem', borderRadius: '4px', marginTop: '1rem' }}>
            <ul style={{ listStyle: 'none', lineHeight: '2' }}>
              <li><strong>ID Utilisateur :</strong> {user?.id}</li>
              <li><strong>Username :</strong> {user?.username}</li>
              <li><strong>Email :</strong> {user?.email}</li>
              <li>
                <strong>Rôle :</strong>{' '}
                <span style={{ 
                  background: '#0056b3', 
                  color: 'white', 
                  padding: '2px 8px', 
                  borderRadius: '12px',
                  fontSize: '0.85rem',
                  textTransform: 'capitalize'
                }}>
                  {user?.role || 'Utilisateur standard'}
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
