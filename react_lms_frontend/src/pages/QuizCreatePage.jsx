import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { QuizService } from '../api/quiz.service';
import { FormationService } from '../api/formation.service';
import '../styles/index.css';

const QuizCreatePage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  // États pour le formulaire
  const [formData, setFormData] = useState({
    titre: '',
    formation: '',
    duree: '00:45:00',
    status: 'draft'
  });

  // États pour charger les formations dynamiquement
  const [formations, setFormations] = useState([]);
  const [isLoadingFormations, setIsLoadingFormations] = useState(true);

  // État pour le chargement du quiz existant (mode modification)
  const [isLoadingQuiz, setIsLoadingQuiz] = useState(isEditing);

  // États pour la soumission
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Charger les formations au chargement de la page
  useEffect(() => {
    const fetchFormations = async () => {
      try {
        const data = await FormationService.getAll();
        // Gère le cas où Django renvoie les données directement, ou sous forme paginée (data.results)
        setFormations(data.results || data);
      } catch (err) {
        console.error("Erreur lors de la récupération des formations:", err);
        setError("Impossible de charger la liste des formations.");
      } finally {
        setIsLoadingFormations(false);
      }
    };

    fetchFormations();
  }, []);

  // En mode modification, charger les données du quiz à éditer
  useEffect(() => {
    if (!isEditing) return;

    const fetchQuiz = async () => {
      try {
        const data = await QuizService.getQuizById(id);
        setFormData({
          titre: data.titre ?? '',
          formation: data.formation ?? '',
          duree: data.duree ?? '00:45:00',
          status: data.status ?? 'draft'
        });
      } catch (err) {
        console.error("Erreur lors de la récupération du quiz:", err);
        setError("Impossible de charger ce quiz.");
      } finally {
        setIsLoadingQuiz(false);
      }
    };

    fetchQuiz();
  }, [id, isEditing]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const payload = {
        ...formData,
        formation: parseInt(formData.formation, 10)
      };

      if (isEditing) {
        await QuizService.updateQuiz(id, payload);
      } else {
        await QuizService.createQuiz(payload);
      }
      navigate('/quizzes');
    } catch (err) {
      setError(err.response?.data?.detail || `Erreur lors de ${isEditing ? 'la modification' : 'la création'} du quiz. Vérifiez les champs.`);
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="lms-scope lms-page lms-page--narrow">
      <div className="lms-container--md" style={{ width: '100%' }}>
        <div className="lms-header-row" style={{ marginBottom: 'var(--space-6)' }}>
          <h1 className="lms-pageheader__title">{isEditing ? 'Modifier le quiz' : 'Créer un nouveau quiz'}</h1>
          <Link to="/quizzes" className="lms-btn lms-btn--outline">
            Retour
          </Link>
        </div>

        {isLoadingQuiz ? (
          <div className="lms-loading">
            <span className="lms-spinner" />
            Chargement du quiz…
          </div>
        ) : (
        <form onSubmit={handleSubmit} className="lms-card lms-card--pad-lg">

          {/* Champ Titre */}
          <div className="lms-field">
            <label className="lms-label">Titre du quiz *</label>
            <input
              type="text"
              name="titre"
              className="lms-input"
              value={formData.titre}
              onChange={handleChange}
              placeholder="Ex : Évaluation finale — Module React"
              required
            />
          </div>

          {/* Champ Formation (SELECT DYNAMIQUE) */}
          <div className="lms-field">
            <label className="lms-label">Formation *</label>
            <select
              name="formation"
              className="lms-select"
              value={formData.formation}
              onChange={handleChange}
              required
              disabled={isLoadingFormations}
            >
              <option value="" disabled>-- Sélectionnez une formation --</option>
              {formations.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.nom_formation}
                </option>
              ))}
            </select>
            {isLoadingFormations && <p className="lms-form-note">Chargement des formations…</p>}
          </div>

          <div className="lms-field">
            <label className="lms-label">Durée (HH:MM:SS) *</label>
            <input
              type="text"
              name="duree"
              className="lms-input lms-num"
              value={formData.duree}
              onChange={handleChange}
              placeholder="00:45:00"
              pattern="[0-9]{2}:[0-9]{2}:[0-9]{2}"
              title="Le format doit être HH:MM:SS"
              required
            />
          </div>

          <div className="lms-field">
            <label className="lms-label">Statut</label>
            <select
              name="status"
              className="lms-select"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="draft">Brouillon (draft)</option>
              <option value="published">Publié (published)</option>
            </select>
          </div>

          {error && <div className="lms-alert lms-alert--danger" style={{ marginBottom: 'var(--space-5)' }}>{error}</div>}

          <button type="submit" className="lms-btn lms-btn--success lms-btn--block" disabled={isSubmitting || isLoadingFormations}>
            {isSubmitting
              ? (isEditing ? 'Enregistrement…' : 'Création en cours…')
              : (isEditing ? 'Enregistrer les modifications' : 'Créer le quiz')}
          </button>
        </form>
        )}
      </div>
    </div>
  );
};

export default QuizCreatePage;
