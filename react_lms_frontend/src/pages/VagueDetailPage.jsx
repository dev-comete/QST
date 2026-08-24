import React, { useEffect, useState } from 'react';
import { useParams , Link} from 'react-router-dom';
import { VagueService } from '../api/vague.service';
import { UserService } from '../api/user.service';
import { QuizService } from '../api/quiz.service';
import '../styles/index.css';

export default function VagueDetailPage() {
  const { id } = useParams();

  const [vague, setVague] = useState(null);
  const [apprenantsDisponibles, setApprenantsDisponibles] = useState([]);
  
  // 🌟 NOUVEAU : On utilise un tableau pour stocker plusieurs IDs
  const [selectedApprenantIds, setSelectedApprenantIds] = useState([]);

  // États pour les Quiz
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

      // 3. Récupération des Quiz du formateur
      const quizzes = await QuizService.getQuizzes();
      const listeQuizzes = quizzes.results || quizzes;
      setQuizzesDisponibles(listeQuizzes);

    } catch (error) {
      console.error("Erreur de chargement", error);
    } finally {
      setLoading(false);
    }
  };

  // --- ACTIONS ---

  // 🌟 NOUVEAU : Fonction pour cocher/décocher un étudiant
  const toggleStudent = (studentId) => {
    setSelectedApprenantIds((prev) => {
      if (prev.includes(studentId)) {
        return prev.filter(id => id !== studentId); // Décocher
      } else {
        return [...prev, studentId]; // Cocher
      }
    });
  };

  // 🌟 MIS À JOUR : Envoi du tableau d'étudiants
  const handleAssignStudents = async (e) => {
    e.preventDefault();
    if (selectedApprenantIds.length === 0) return;

    try {
      // Assurez-vous que votre VagueService expose bien cette méthode qui envoie 'etudiant_ids'
      const response = await VagueService.assignStudents(id, selectedApprenantIds);
      alert(response.message);
      fetchData(); // Rafraîchir la liste
      setSelectedApprenantIds([]); // Vider la sélection
    } catch (error) {
      console.error("Erreur lors de l'inscription", error);
      alert(error.response?.data?.error || "Erreur lors de l'assignation");
    }
  };

  const handleAssignQuiz = async (e) => {
    e.preventDefault();
    if (!selectedQuizId) return;

    try {
      const response = await VagueService.assignQuiz(id, selectedQuizId);
      alert(response.message);
      setSelectedQuizId('');
    } catch (error) {
      console.error("Erreur d'assignation du quiz", error);
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

  // 🌟 BONUS UX : On filtre les apprenants pour ne pas afficher ceux qui sont déjà dans la vague
  const apprenantsNonInscrits = apprenantsDisponibles.filter(
    (apprenant) => !vague.etudiants.some((e) => e.etudiant_id === apprenant.id)
  );

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
          <Link to={`/vagues/${vague.id}/analytics`} className="lms-btn lms-btn--primary">
              Voir les statistiques
            </Link>
        </div>

        <div className="lms-grid lms-grid--sidebar">

          {/* Colonne de gauche : Formulaires d'actions */}
          <div className="lms-stack">

            {/* 🌟 Action 1 : Inscription en masse */}
            <div className="lms-card lms-card--tab">
              <div className="lms-card__title" style={{ marginBottom: 'var(--space-4)' }}>Inscrire des étudiants</div>
              <form onSubmit={handleAssignStudents} className="lms-stack" style={{ gap: 'var(--space-4)' }}>
                
                <div className="lms-picker" style={{ maxHeight: '220px', overflowY: 'auto', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}>
                  {apprenantsNonInscrits.length === 0 ? (
                    <div style={{ padding: 'var(--space-4)', textAlign: 'center', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                      Tous les apprenants disponibles sont déjà inscrits.
                    </div>
                  ) : (
                    apprenantsNonInscrits.map(apprenant => (
                      <label 
                        key={apprenant.id} 
                        style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          padding: 'var(--space-3)', 
                          borderBottom: '1px solid var(--color-border)',
                          cursor: 'pointer',
                          backgroundColor: selectedApprenantIds.includes(apprenant.id) ? 'var(--color-surface-hover)' : 'transparent',
                          margin: 0
                        }}
                      >
                        <input 
                          type="checkbox" 
                          checked={selectedApprenantIds.includes(apprenant.id)}
                          onChange={() => toggleStudent(apprenant.id)}
                          style={{ marginRight: 'var(--space-3)' }}
                        />
                        <div>
                          <strong style={{ display: 'block', fontSize: 'var(--text-sm)' }}>{apprenant.username}</strong>
                          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>{apprenant.email}</div>
                        </div>
                      </label>
                    ))
                  )}
                </div>

                <button 
                  type="submit" 
                  className="lms-btn lms-btn--primary lms-btn--block"
                  disabled={selectedApprenantIds.length === 0}
                >
                  Ajouter {selectedApprenantIds.length > 0 ? `(${selectedApprenantIds.length})` : ''} à la vague
                </button>
              </form>
            </div>

            {/* Action 2 : Assigner un Quiz massif */}
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
                    // 🌟 MIS À JOUR : On utilise le nouveau champ `titre` !
                    <option key={quiz.id} value={quiz.id}>
                      {quiz.titre || `Quiz #${quiz.id}`} {quiz.status === 'draft' ? '(Brouillon)' : ''}
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