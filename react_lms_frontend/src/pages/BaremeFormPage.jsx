import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { BaremeService } from '../api/bareme.service';
import '../styles/index.css';

export default function BaremeFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const isEditing = Boolean(id);

  const [formData, setFormData] = useState({
    pts: '',
  });

  useEffect(() => {
    if (isEditing) {
      BaremeService.getById(id)
        .then(data => setFormData(data))
        .catch(err => console.error("Erreur de chargement", err));
    }
  }, [id, isEditing]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await BaremeService.update(id, formData);
      } else {
        await BaremeService.create(formData);
      }
      navigate('/baremes');
    } catch (error) {
      console.error("Erreur lors de l'enregistrement", error);
      alert("Une erreur est survenue.");
    }
  };

  return (
    <div className="lms-scope lms-page lms-page--narrow">
      <div className="lms-container--md" style={{ width: '100%' }}>
        <h1 className="lms-pageheader__title" style={{ marginBottom: 'var(--space-6)' }}>
          {isEditing ? 'Modifier le barème' : 'Créer un barème'}
        </h1>

        <form onSubmit={handleSubmit} className="lms-card lms-card--pad-lg">
          <div className="lms-field">
            <label className="lms-label">
              Valeur (en points)
            </label>
            <input
              type="number"
              name="pts"
              value={formData.pts}
              onChange={handleChange}
              required
              step="0.1" // Permet les nombres décimaux (ex: 1.5, 0.5)
              min="0"
              className="lms-input lms-num"
              placeholder="Ex: 2 ou 1.5"
            />
          </div>

          <div className="lms-form-actions">
            <button
              type="submit"
              className="lms-btn lms-btn--primary"
            >
              Enregistrer
            </button>
            <button
              type="button"
              onClick={() => navigate('/baremes')}
              className="lms-btn lms-btn--outline"
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
