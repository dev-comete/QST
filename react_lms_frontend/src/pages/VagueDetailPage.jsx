import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { VagueService } from '../api/vague.service';
import { UserService } from '../api/user.service';
import { QuizService } from '../api/quiz.service';
import '../styles/index.css';

export default function VagueDetailPage() {
  const { id } = useParams();

  const [vague, setVague] = useState(null);
  const [apprenantsDisponibles, setApprenantsDisponibles] = useState([]);
  const [selectedApprenantId, setSelectedApprenantId] = useState('');

  // 🌟 Nouveaux états pour les Quiz
  const [quizzesDisponibles, setQuizzesDisponibles] = useState([]);
  const [selectedQuizId, setSelectedQuizId] = useState('');

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      // 1. Récupération de la Vague
      const vagues = await VagueService.getAll();
      const currentVague = vagues.find(v => v.id === parseInt(id));
      setVague(currentVague);

      // 2. Récupération des Apprenants
      const apprenants = await UserService.getApprenants();
      setApprenantsDisponibles(apprenants);

      // 🌟 3. Récupération des Quiz du formateur
      // (On gère le cas où l'API renvoie des données paginées avec .results)
      const quizzes = await QuizService.getQuizzes(); // Adaptez le nom de la méthode si besoin
      const listeQuizzes = quizzes.results || quizzes;
      setQuizzesDisponibles(listeQuizzes);

    } catch (error) {
      console.error("Erreur de chargement", error);
    } finally {
      setLoading(false);
    }
  };

  // --- ACTIONS ---

  const handleAssignStudent = async (e) => {
    e.preventDefault();
    if (!selectedApprenantId) return;

    try {
      const response = await VagueService.assignStudent(id, selectedApprenantId);
      alert(response.message);
      fetchData();
      setSelectedApprenantId('');
    } catch (error) {
      console.error("Erreur lors de l'inscription", error);
      alert(error.response?.data?.error || "Erreur lors de l'assignation");
    }
  };

  // 🌟 NOUVELLE ACTION : Assigner le Quiz
  const handleAssignQuiz = async (e) => {
    e.preventDefault();
    if (!selectedQuizId) return;

    try {
      const response = await VagueService.assignQuiz(id, selectedQuizId);
      alert(response.message); // Ex: "Succès ! Le quiz a été assigné à X étudiants."
      setSelectedQuizId(''); // On réinitialise la liste déroulante
    } catch (error) {
      console.error("Erreur d'assignation du quiz", error);
      // Le backend renverra une erreur si le quiz ne fait pas partie de la même formation
      const errorMsg = error.response?.data?.non_field_errors?.[0] || error.response?.data?.error || "Impossible d'assigner ce quiz.";
      alert(errorMsg);
    }
  };

  if (loading) {
    return (
      <div className="lms-scope lms-page">
        <div className="lms-container lms-loading">
          <span className="lms-spinner" />
          Chargement des détails de la vague…
        </div>
      </div>
    );
  }

  if (!vague) {
    return (
      <div className="lms-scope lms-page">
        <div className="lms-container">
          <div className="lms-empty">
            <p className="lms-empty__title">Vague introuvable</p>
            <p>Cette session n'existe pas ou a été supprimée.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="lms-scope lms-page">
      <div className="lms-container">
        {/* En-tête */}
        <div className="lms-card lms-card--pad-lg lms-header-row" style={{ marginBottom: 'var(--space-6)' }}>
          <div>
            <p className="lms-eyebrow" style={{ marginBottom: 'var(--space-2)' }}>Session</p>
            <h1 className="lms-pageheader__title">{vague.formation_nom}</h1>
            <p className="lms-pageheader__subtitle">
              Du {new Date(vague.debut).toLocaleDateString()} au {new Date(vague.fin).toLocaleDateString()}
            </p>
          </div>
          <div className="lms-headline-stat">
            {vague.etudiants.length} inscrit(s)
          </div>
        </div>

        <div className="lms-grid lms-grid--sidebar">

          {/* Colonne de gauche : Formulaires d'actions */}
          <div className="lms-stack">

            {/* Action 1 : Inscrire un étudiant */}
            <div className="lms-card lms-card--tab">
              <div className="lms-card__title" style={{ marginBottom: 'var(--space-4)' }}>Inscrire un étudiant</div>
              <form onSubmit={handleAssignStudent} className="lms-stack" style={{ gap: 'var(--space-4)' }}>
                <select
                  className="lms-select"
                  value={selectedApprenantId}
                  onChange={(e) => setSelectedApprenantId(e.target.value)}
                  required
                >
                  <option value="">-- Choisir un apprenant --</option>
                  {apprenantsDisponibles.map(apprenant => (
                    <option key={apprenant.id} value={apprenant.id}>
                      {apprenant.username} ({apprenant.email})
                    </option>
                  ))}
                </select>
                <button type="submit" className="lms-btn lms-btn--primary lms-btn--block">
                  Ajouter à la vague
                </button>
              </form>
            </div>

            {/* 🌟 Action 2 : Assigner un Quiz massif */}
            <div className="lms-card lms-card--tab-success">
              <div className="lms-card__title">Assigner un quiz</div>
              <p className="lms-card__hint">
                Ce quiz sera assigné à <strong>tous les étudiants</strong> actuellement inscrits dans cette vague.
              </p>
              <form onSubmit={handleAssignQuiz} className="lms-stack" style={{ gap: 'var(--space-4)' }}>
                <select
                  className="lms-select"
                  value={selectedQuizId}
                  onChange={(e) => setSelectedQuizId(e.target.value)}
                  required
                >
                  <option value="">-- Choisir un quiz --</option>
                  {quizzesDisponibles.map(quiz => (
                    <option key={quiz.id} value={quiz.id}>
                      Quiz #{quiz.id} {quiz.status === 'draft' ? '(Brouillon)' : ''}
                    </option>
                  ))}
                </select>
                <button type="submit" className="lms-btn lms-btn--success lms-btn--block">
                  Assigner à toute la classe
                </button>
              </form>
            </div>

          </div>

          {/* Colonne de droite : Liste des inscrits */}
          <div className="lms-card lms-card--flush">
            <div style={{ padding: 'var(--space-5) var(--space-5) 0' }}>
              <div className="lms-card__title">Étudiants inscrits dans la session</div>
            </div>

            <table className="lms-table" style={{ marginTop: 'var(--space-3)' }}>
              <thead>
                <tr>
                  <th>Nom d'utilisateur</th>
                  <th>Email</th>
                </tr>
              </thead>
              <tbody>
                {vague.etudiants.length === 0 ? (
                  <tr>
                    <td colSpan="2" className="lms-table__empty">
                      Aucun étudiant inscrit dans cette vague pour le moment.
                    </td>
                  </tr>
                ) : (
                  vague.etudiants.map(etudiant => (
                    <tr key={etudiant.etudiant_id}>
                      <td className="lms-table__name">{etudiant.username}</td>
                      <td>{etudiant.email}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </div>
  );
}
