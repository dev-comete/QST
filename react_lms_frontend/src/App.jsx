import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

import ProtectedRoute from './components/ProtectedRoute';
import FormateurRoute from './components/FormateurRoute'; 
import MainLayout from './components/MainLayout';

import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import QuestionBankPage from './pages/QuestionBankPage';
import QuizListPage from './pages/QuizListPage';
import QuizCreatePage from './pages/QuizCreatePage';
import QuizAssignQuestionsPage from './pages/QuizAssignQuestionsPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Routes Publiques */}
          <Route path="/login" element={<LoginPage />} />
          
            {/* Routes Protégées (Nécessite juste d'être connecté) */}
            <Route 
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
            {/* Accessible à TOUT le monde (Apprenants, Formateurs, Admins) */}
            <Route path="/dashboard" element={<DashboardPage />} />
            
            {/* Routes RESTREINTES (Nécessite le rôle formateur/admin) */}
            <Route 
              path="/banque-questions" 
              element={
                <FormateurRoute>
                  <QuestionBankPage />
                </FormateurRoute>
              } 
            />
              <Route 
                path="/quizzes" 
                element={
                  <FormateurRoute>
                    <QuizListPage />
                  </FormateurRoute>
                } 
              />

              {/* Création d'un Quiz (DOIT être déclarée explicitement ici) */}
            <Route 
              path="/quizzes/create" 
              element={
                <FormateurRoute>
                  <QuizCreatePage />
                </FormateurRoute>
              } 
            />

            <Route 
              path="/quizzes/:id/assign" 
              element={
                <FormateurRoute>
                  <QuizAssignQuestionsPage />
                </FormateurRoute>
              } 
            />

          </Route>
          
          {/* Fallbacks */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;