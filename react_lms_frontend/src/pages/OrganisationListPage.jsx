import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { OrganisationService } from '../api/organisations.service'; 

export default function OrganisationListPage() {
  const [organisations, setOrganisations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrganisations();
  }, []);

  const fetchOrganisations = async () => {
    try {
      const data = await OrganisationService.getAll();
      setOrganisations(data.results || data);
    } catch (error) {
      console.error("Erreur de chargement", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette organisation ? Tous les utilisateurs associés perdront leur lien avec celle-ci.")) {
      try {
        await OrganisationService.delete(id);
        setOrganisations(organisations.filter(org => org.id !== id));
      } catch (error) {
        console.error("Erreur lors de la suppression", error);
        alert("Erreur lors de la suppression.");
      }
    }
  };

  return (
    <div className="lms-scope">
      <div className="lms-page">
        <div className="lms-container">
          
          <div className="lms-pageheader">
            <div>
              <h1 className="lms-pageheader__title">Gestion des Organisations</h1>
              <p className="lms-pageheader__subtitle">Gérez les écoles, entreprises ou centres de formation.</p>
            </div>
            <Link to="/organisations/create" className="lms-btn lms-btn--primary">
              + Nouvelle Organisation
            </Link>
          </div>

          {loading ? (
            <div className="lms-loading">
              <div className="lms-spinner"></div>
              <span>Chargement des organisations...</span>
            </div>
          ) : (
            <div className="lms-tablewrap">
              <table className="lms-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nom</th>
                    <th>Date de création</th>
                    <th>Statut</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {organisations.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="lms-table__empty">Aucune organisation trouvée.</td>
                    </tr>
                  ) : (
                    organisations.map((org) => (
                      <tr key={org.id}>
                        <td className="lms-table__id">#{org.id}</td>
                        <td className="lms-table__name">{org.nom}</td>
                        <td>{new Date(org.date_creation).toLocaleDateString()}</td>
                        <td>
                          <span 
                            className="lms-eyebrow" 
                            style={{ color: org.is_active ? 'var(--color-success)' : 'var(--color-slate)' }}
                          >
                            {org.is_active ? 'Actif' : 'Inactif'}
                          </span>
                        </td>
                        <td>
                          <div className="lms-table__actions">
                            <Link to={`/organisations/${org.id}/edit`} className="lms-btn lms-btn--link-text lms-btn--sm">
                              Modifier
                            </Link>
                            <button 
                              onClick={() => handleDelete(org.id)} 
                              className="lms-btn lms-btn--danger-text lms-btn--sm"
                            >
                              Supprimer
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
}