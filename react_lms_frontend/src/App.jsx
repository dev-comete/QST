import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

import PublicRoute from './components/PublicRoute';
import ProtectedRoute from './components/ProtectedRoute';
import FormateurRoute from './components/FormateurRoute'; 
import MainLayout from './components/MainLayout';

import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import QuestionBankPage from './pages/QuestionBankPage';
import QuizListPage from './pages/QuizListPage';
import QuizCreatePage from './pages/QuizCreatePage';
import QuizAssignQuestionsPage from './pages/QuizAssignQuestionsPage';

import BaremeListPage from './pages/BaremeListPage';
import BaremeFormPage from './pages/BaremeFormPage';

import FormationListPage from './pages/FormationListPage';
import FormationFormPage from './pages/FormationFormPage';

import VagueFormPage from './pages/VagueFormPage';
import VagueListPage from './pages/VagueListPage';
import VagueDetailPage from './pages/VagueDetailPage';

import UserListPage from './pages/UserListPage';
import UserFormPage from './pages/UserFormPage';
import AdminRoute from './components/AdminRoute';

import OrganisationListPage from './pages/OrganisationListPage';
import OrganisationFormPage from './pages/OrganisationFormPage';

import SetPasswordPage from './pages/SetPasswordPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Routes Publiques */}
            <Route path="/login" element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            } />

            <Route 
            path="/set-password/:uid/:token" 
            element={
              <PublicRoute>
                <SetPasswordPage />
              </PublicRoute>
            } />
          
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

            <Route 
              path="/baremes" 
              element={
                <FormateurRoute>
                  <BaremeListPage />
                </FormateurRoute>
              } 
            />

            <Route 
              path="/baremes/create" 
              element={
                <FormateurRoute>
                  <BaremeFormPage />
                </FormateurRoute>
              } 
            />

            <Route 
              path="/baremes/:id/edit" 
              element={
                <FormateurRoute>
                  <BaremeFormPage />
                </FormateurRoute>
              } 
            />

            <Route 
              path="/formations" 
              element={
                <FormateurRoute>
                  <FormationListPage />
                </FormateurRoute>
              } 
            />

            <Route 
              path="/formations/create" 
              element={
                <FormateurRoute>
                  <FormationFormPage />
                </FormateurRoute>
              } 
            />

            <Route 
              path="/formations/:id/edit" 
              element={
                <FormateurRoute>
                  <FormationFormPage />
                </FormateurRoute>
              } 
            />

            <Route 
              path="/vagues/create" 
              element={
                <FormateurRoute>
                  <VagueFormPage />
                </FormateurRoute>
              } 
            />

            <Route 
              path="/vagues" 
              element={
                <FormateurRoute>
                  <VagueListPage />
                </FormateurRoute>
              } 
            />

            <Route 
              path="/vagues/:id" 
              element={
                <FormateurRoute>
                  <VagueDetailPage />
                </FormateurRoute>
              } 
            />
            <Route 
              path="/users" 
              element={
                <AdminRoute>
                  <UserListPage />
                </AdminRoute>
              }
            />
            <Route 
              path="/users/create" 
              element={
                <AdminRoute>
                  <UserFormPage />
                </AdminRoute>
              }
            />
            <Route 
              path="/users/:id/edit" 
              element={
                <AdminRoute>
                  <UserFormPage />
                </AdminRoute>
              }
            />

            <Route path="/organisations" element={<AdminRoute><OrganisationListPage /></AdminRoute>} />

            <Route path="/organisations/create" element={<AdminRoute><OrganisationFormPage /></AdminRoute>} />

            <Route path="/organisations/:id/edit" element={<AdminRoute><OrganisationFormPage /></AdminRoute>} />

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