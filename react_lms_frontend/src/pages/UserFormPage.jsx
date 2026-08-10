import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { UserService } from '../api/user.service';

export default function UserFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [roles, setRoles] = useState([]);
  const [organisations, setOrganisations] = useState([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    type_utilisateur: '',
    organisation: [] 
  });

  useEffect(() => {
    const fetchDependencies = async () => {
      try {
        const [rolesData, orgsData] = await Promise.all([
          UserService.getRoles(),
          UserService.getOrganisations()
        ]);
        setRoles(rolesData.results || rolesData);
        setOrganisations(orgsData.results || orgsData);

        if (isEditing) {
          const userData = await UserService.getById(id);
          setFormData({
            username: userData.username,
            email: userData.email,
            type_utilisateur: userData.type_utilisateur || '',
            organisation: userData.organisation || []
          });
        }
      } catch (err) {
        console.error("Erreur de chargement", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDependencies();
  }, [id, isEditing]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleOrganisationToggle = (orgId) => {
    setFormData(prev => {
      const currentOrgs = prev.organisation;
      if (currentOrgs.includes(orgId)) {
        return { ...prev, organisation: currentOrgs.filter(id => id !== orgId) };
      } else {
        return { ...prev, organisation: [...currentOrgs, orgId] };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await UserService.update(id, formData);
      } else {
        await UserService.create(formData);
      }
      navigate('/users');
    } catch (error) {
      console.error("Erreur d'enregistrement", error);
      alert("Erreur lors de la sauvegarde.");
    }
  };

  return (
    <div className="lms-scope">
      <div className="lms-page lms-page--narrow">
        <div className="lms-container lms-container--md">
          
          <div className="lms-pageheader">
            <h1 className="lms-pageheader__title">
              {isEditing ? 'Modifier Utilisateur' : 'Créer un Utilisateur'}
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
                <label className="lms-label">Nom d'utilisateur</label>
                <input 
                  type="text" 
                  name="username" 
                  value={formData.username} 
                  onChange={handleChange} 
                  required 
                  className="lms-input"
                />
              </div>

              <div className="lms-field">
                <label className="lms-label">Adresse Email</label>
                <input 
                  type="email" 
                  name="email" 
                  value={formData.email} 
                  onChange={handleChange} 
                  required 
                  className="lms-input"
                />
                {!isEditing && (
                  <p className="lms-form-note">Un email d'activation sera envoyé automatiquement à cette adresse.</p>
                )}
              </div>

              <div className="lms-field">
                <label className="lms-label">Rôle</label>
                <select 
                  name="type_utilisateur" 
                  value={formData.type_utilisateur} 
                  onChange={handleChange} 
                  required 
                  className="lms-select"
                >
                  <option value="">-- Sélectionner un rôle --</option>
                  {roles.map(role => (
                    <option key={role.id} value={role.id}>{role.type_utilisateur}</option>
                  ))}
                </select>
              </div>

              <div className="lms-field">
                <label className="lms-label">Organisations assignées</label>
                {/* On utilise lms-picker pour afficher une belle liste d'éléments sélectionnables */}
                <div className="lms-picker" style={{ maxHeight: 'none' }}>
                  {organisations.map(org => (
                    <label key={org.id} className="lms-picker-item" style={{ cursor: 'pointer' }}>
                      <span className="lms-picker-item__text">{org.nom}</span>
                      <input 
                        type="checkbox"
                        checked={formData.organisation.includes(org.id)}
                        onChange={() => handleOrganisationToggle(org.id)}
                        style={{ accentColor: 'var(--color-harbor)' }}
                      />
                    </label>
                  ))}
                </div>
              </div>

              <div className="lms-form-actions">
                <button type="submit" className="lms-btn lms-btn--primary">
                  {isEditing ? 'Enregistrer les modifications' : 'Créer l\'utilisateur'}
                </button>
                <button 
                  type="button" 
                  onClick={() => navigate('/users')} 
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