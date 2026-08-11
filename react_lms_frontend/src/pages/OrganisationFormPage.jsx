import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { OrganisationService } from '../api/organisations.service'; 

export default function OrganisationFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(isEditing); // Ne charge que si on édite
  const [formData, setFormData] = useState({
    nom: '',
    is_active: true
  });

  useEffect(() => {
    if (isEditing) {
      OrganisationService.getById(id)
        .then(data => {
          setFormData({
            nom: data.nom,
            is_active: data.is_active
          });
        })
        .catch(err => console.error("Erreur de chargement", err))
        .finally(() => setLoading(false));
    }
  }, [id, isEditing]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ 
      ...formData, 
      [name]: type === 'checkbox' ? checked : value 
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await OrganisationService.update(id, formData);
      } else {
        await OrganisationService.create(formData);
      }
      navigate('/organisations');
    } catch (error) {
      console.error("Erreur d'enregistrement", error);
      alert("Erreur lors de la sauvegarde. Vérifiez que ce nom d'organisation n'existe pas déjà.");
    }
  };

  return (
    <div className="lms-scope">
      <div className="lms-page lms-page--narrow">
        <div className="lms-container lms-container--md">
          
          <div className="lms-pageheader">
            <h1 className="lms-pageheader__title">
              {isEditing ? 'Modifier Organisation' : 'Créer une Organisation'}
            </h1>
          </div>

          {loading ? (
            <div className="lms-loading">
              <div className="lms-spinner"></div>
              <span>Chargement...</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="lms-card lms-card--pad-lg">
              
              <div className="lms-field">
                <label className="lms-label">Nom de l'organisation *</label>
                <input 
                  type="text" 
                  name="nom" 
                  value={formData.nom} 
                  onChange={handleChange} 
                  required 
                  className="lms-input"
                  placeholder="Ex: École de commerce de Paris"
                />
              </div>

              <div className="lms-field" style={{ marginTop: 'var(--space-6)' }}>
                <label className="lms-picker-item" style={{ cursor: 'pointer' }}>
                  <span className="lms-picker-item__text">
                    <strong>Organisation active</strong>
                    <br/>
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-slate)' }}>
                      Les utilisateurs de cette organisation pourront se connecter.
                    </span>
                  </span>
                  <input 
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleChange}
                    style={{ accentColor: 'var(--color-harbor)', transform: 'scale(1.2)' }}
                  />
                </label>
              </div>

              <div className="lms-form-actions">
                <button type="submit" className="lms-btn lms-btn--primary">
                  {isEditing ? 'Enregistrer les modifications' : 'Créer l\'organisation'}
                </button>
                <button 
                  type="button" 
                  onClick={() => navigate('/organisations')} 
                  className="lms-btn lms-btn--ghost"
                >
                  Annuler
                </button>
              </div>

            </form>
          )}

        </div>
      </div>
    </div>
  );
}