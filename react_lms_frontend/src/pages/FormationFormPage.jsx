// src/pages/FormationFormPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FormationService } from '../api/formation.service';
import '../styles/index.css';

export default function FormationFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState({
    nom_formation: '',
  });

  useEffect(() => {
    if (isEditing) {
      FormationService.getById(id)
        .then(data => setFormData({ nom_formation: data.nom_formation }))
        .catch(err => console.error(err));
    }
  }, [id, isEditing]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await FormationService.update(id, formData);
      } else {
        // L'API assigne automatiquement le formateur et son organisation !
        await FormationService.create(formData);
      }
      navigate('/formations');
    } catch (error) {
      console.error("Erreur", error);
      alert("Erreur lors de l'enregistrement.");
    }
  };

  return (
    <div className="lms-scope lms-page lms-page--narrow">
      <div className="lms-container--md" style={{ width: '100%' }}>
        <h1 className="lms-pageheader__title" style={{ marginBottom: 'var(--space-6)' }}>
          {isEditing ? 'Modifier la formation' : 'Créer une formation'}
        </h1>
        <form onSubmit={handleSubmit} className="lms-card lms-card--pad-lg">
          <div className="lms-field">
            <label className="lms-label">Nom de la formation</label>
            <input
              type="text"
              name="nom_formation"
              value={formData.nom_formation}
              onChange={(e) => setFormData({ nom_formation: e.target.value })}
              required
              className="lms-input"
              placeholder="Ex : Développement web full-stack"
            />
          </div>
          <div className="lms-form-actions">
            <button type="submit" className="lms-btn lms-btn--primary">
              Enregistrer
            </button>
            <button type="button" onClick={() => navigate('/formations')} className="lms-btn lms-btn--outline">
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
