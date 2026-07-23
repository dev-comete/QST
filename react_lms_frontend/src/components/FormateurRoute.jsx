import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const FormateurRoute = ({ children }) => {
  const { user } = useAuth();
  
  // 1. Vérification de sécurité : l'utilisateur est-il bien connecté ?
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // 2. Vérification du rôle : est-il formateur ou admin ?
  const isAuthorized = user.role === 'formateur' || user.role === 'admin';
  
  if (!isAuthorized) {
    // S'il est juste "apprenant", on le renvoie au tableau de bord
    return <Navigate to="/dashboard" replace />;
  }
  
  // 3. S'il a les droits, on affiche la page demandée
  return children;
};

export default FormateurRoute;