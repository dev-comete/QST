// src/components/ApprenantRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ApprenantRoute = ({ children }) => {
  const { user } = useAuth();
  
  // 1. Vérification : l'utilisateur est-il connecté ?
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // 2. Vérification du rôle : est-il strictement un apprenant ?
  // (On empêche les formateurs/admins d'accéder aux vues étudiantes)
  if (user.role !== 'apprenant') {
    return <Navigate to="/dashboard" replace />;
  }
  
  // 3. S'il a le bon rôle, on affiche la page
  return children;
};

export default ApprenantRoute;