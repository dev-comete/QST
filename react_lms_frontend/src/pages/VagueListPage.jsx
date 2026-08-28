import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { VagueService } from '../api/vague.service';
import '../styles/index.css';

export default function VagueListPage() {
  const [vagues, setVagues] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchVagues();
  }, []);

  const fetchVagues = async () => {
    try {
      const data = await VagueService.getAll();
      setVagues(data);
    } catch (error) {
      console.error("Erreur lors de la récupération des vagues", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="lms-scope lms-page">
        <div className="lms-container lms-loading">
          <span className="lms-spinner" />
          Chargement des vagues…
        </div>
      </div>
    );
  }

  return (
    <div className="lms-scope lms-page">
      <div className="lms-container">
        <div className="lms-pageheader">
          <div>
            <h1 className="lms-pageheader__title">Vagues &amp; sessions</h1>
            <p className="lms-pageheader__subtitle">Planifiez et suivez les sessions de vos formations.</p>
          </div>
          <button
            type="button"
            className="lms-btn lms-btn--success"
            onClick={() => navigate('/vagues/create')}
          >
            + Nouvelle vague
          </button>
        </div>

        <div className="lms-tablewrap">
          <table className="lms-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Formation</th>
                <th>Date de début</th>
                <th>Date de fin</th>
                <th>Inscrits</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {vagues.length === 0 ? (
                <tr>
                  <td colSpan="6" className="lms-table__empty">
                    Aucune vague n'a été trouvée.
                  </td>
                </tr>
              ) : (
                vagues.map((vague) => (
                  <tr key={vague.id}>
                    <td className="lms-table__id">#{vague.id}</td>
                    <td className="lms-table__name">{vague.formation_nom}</td>
                    <td>{new Date(vague.debut).toLocaleDateString()}</td>
                    <td>{new Date(vague.fin).toLocaleDateString()}</td>
                    <td>
                      <span className="lms-badge lms-badge--harbor">
                        {vague.etudiants?.length || 0} apprenants
                      </span>
                    </td>
                    <td>
                      <Link to={`/vagues/${vague.id}`} className="lms-btn lms-btn--link-text lms-btn--sm">
                        Gérer les inscriptions
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
