// src/components/PublicRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Navigation guard: Redirects to dashboard if user IS already authenticated
const PublicRoute = ({ children }) => {
  const { user } = useAuth();
  
  if (user) {
    // Si l'utilisateur est connecté, on le force à aller sur le dashboard
    return <Navigate to="/dashboard" replace />;
  }
  
  // Sinon, on affiche la page demandée (ex: LoginPage)
  return children;
};

export default PublicRoute;