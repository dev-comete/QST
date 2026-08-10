import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BaremeService } from '../api/bareme.service';
import '../styles/index.css';

export default function BaremeListPage() {
  const [baremes, setBaremes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBaremes();
  }, []);

  const fetchBaremes = async () => {
    try {
      const data = await BaremeService.getAll();
      setBaremes(data);
    } catch (error) {
      console.error("Erreur lors de la récupération des barèmes", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce barème ?")) {
      try {
        await BaremeService.delete(id);
        setBaremes(baremes.filter(b => b.id !== id));
      } catch (error) {
        console.error("Erreur lors de la suppression", error);
      }
    }
  };

  if (loading) {
    return (
      <div className="lms-scope lms-page">
        <div className="lms-container lms-loading">
          <span className="lms-spinner" />
          Chargement des barèmes…
        </div>
      </div>
    );
  }

  return (
    <div className="lms-scope lms-page">
      <div className="lms-container">
        <div className="lms-pageheader">
          <div>
            <h1 className="lms-pageheader__title">Gestion des barèmes</h1>
            <p className="lms-pageheader__subtitle">Les grilles de points réutilisables pour vos questions.</p>
          </div>
          <Link
            to="/baremes/create"
            className="lms-btn lms-btn--primary"
          >
            + Nouveau barème
          </Link>
        </div>

        <div className="lms-tablewrap">
          <table className="lms-table">
            <thead>
              <tr>
                <th>Points</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {baremes.length === 0 ? (
                <tr><td colSpan="2" className="lms-table__empty">Aucun barème trouvé.</td></tr>
              ) : (
                baremes.map((bareme) => (
                  <tr key={bareme.id}>
                    <td className="lms-table__name lms-num">{bareme.pts} pts</td>
                    <td>
                      <div className="lms-table__actions">
                        <Link
                          to={`/baremes/${bareme.id}/edit`}
                          className="lms-btn lms-btn--link-text lms-btn--sm"
                        >
                          Modifier
                        </Link>
                        <button
                          onClick={() => handleDelete(bareme.id)}
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
      </div>
    </div>
  );
}
