import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { QuizService } from '../api/quiz.service';
import { FormationService } from '../api/formation.service'; // <-- Nouvel import

const QuizCreatePage = () => {
  const navigate = useNavigate();
  
  // États pour le formulaire
  const [formData, setFormData] = useState({
    formation: '', 
    duree: '00:45:00',
    status: 'draft'
  });
  
  // États pour charger les formations dynamiquement
  const [formations, setFormations] = useState([]);
  const [isLoadingFormations, setIsLoadingFormations] = useState(true);

  // États pour la soumission
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Charger les formations au chargement de la page
  useEffect(() => {
    const fetchFormations = async () => {
      try {
        const data = await FormationService.getFormations();
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

      await QuizService.createQuiz(payload);
      navigate('/quizzes');
    } catch (err) {
      setError(err.response?.data?.detail || 'Erreur lors de la création du quiz. Vérifiez les champs.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container" style={{ marginTop: '30px', maxWidth: '600px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Créer un nouveau Quiz</h2>
        <Link to="/quizzes" className="btn" style={{ backgroundColor: '#6c757d', textDecoration: 'none' }}>
          Retour
        </Link>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit}>
          
          {/* Champ Formation (SELECT DYNAMIQUE) */}
          <div className="form-group">
            <label>Formation *</label>
            <select 
              name="formation" 
              className="form-control" 
              value={formData.formation} 
              onChange={handleChange} 
              required
              disabled={isLoadingFormations}
            >
              <option value="" disabled>-- Sélectionnez une formation --</option>
              {formations.map((f) => (
                <option key={f.id} value={f.id}>
                  {/* Mise à jour ici pour utiliser le bon champ du JSON */}
                  {f.nom_formation} 
                </option>
              ))}
            </select>
            {isLoadingFormations && <small style={{ color: '#0056b3' }}>Chargement des formations...</small>}
          </div>

          <div className="form-group">
            <label>Durée (HH:MM:SS) *</label>
            <input 
              type="text" 
              name="duree" 
              className="form-control" 
              value={formData.duree} 
              onChange={handleChange} 
              placeholder="00:45:00"
              pattern="[0-9]{2}:[0-9]{2}:[0-9]{2}"
              title="Le format doit être HH:MM:SS"
              required 
            />
          </div>

          <div className="form-group">
            <label>Statut</label>
            <select 
              name="status" 
              className="form-control" 
              value={formData.status} 
              onChange={handleChange}
            >
              <option value="draft">Brouillon (draft)</option>
              <option value="published">Publié (published)</option>
            </select>
          </div>

          {error && <div className="text-danger" style={{ marginBottom: '15px' }}>{error}</div>}

          <button type="submit" className="btn" style={{ width: '100%', backgroundColor: '#28a745' }} disabled={isSubmitting || isLoadingFormations}>
            {isSubmitting ? 'Création en cours...' : 'Créer le Quiz'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default QuizCreatePage;