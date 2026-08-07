import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FormationService } from '../api/formation.service';
import '../styles/index.css';

export default function FormationListPage() {
  const [formations, setFormations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFormations();
  }, []);

  const fetchFormations = async () => {
    try {
      const data = await FormationService.getAll();
      setFormations(data);
    } catch (error) {
      console.error("Erreur chargement formations", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Supprimer cette formation définitivement ?")) {
      try {
        await FormationService.delete(id);
        setFormations(formations.filter(f => f.id !== id));
      } catch (error) {
        console.error("Erreur suppression", error);
      }
    }
  };

  if (loading) {
    return (
      <div className="lms-scope lms-page">
        <div className="lms-container lms-loading">
          <span className="lms-spinner" />
          Chargement…
        </div>
      </div>
    );
  }

  return (
    <div className="lms-scope lms-page">
      <div className="lms-container">
        <div className="lms-pageheader">
          <div>
            <h1 className="lms-pageheader__title">Mes formations</h1>
            <p className="lms-pageheader__subtitle">Le catalogue que vous proposez à vos apprenants.</p>
          </div>
          <Link to="/formations/create" className="lms-btn lms-btn--primary">
            + Nouvelle formation
          </Link>
        </div>

        {formations.length === 0 ? (
          <div className="lms-empty">
            <p className="lms-empty__title">Aucune formation trouvée</p>
            <p>Créez votre première formation pour commencer.</p>
          </div>
        ) : (
          <div className="lms-grid lms-grid--3">
            {formations.map((formation) => (
              <div key={formation.id} className="lms-tile">
                <div className="lms-tile__title">{formation.nom_formation}</div>

                <div className="lms-tile__footer">
                  <Link to={`/formations/${formation.id}/edit`} className="lms-btn lms-btn--outline" style={{ flex: 1 }}>
                    Modifier
                  </Link>
                  <button onClick={() => handleDelete(formation.id)} className="lms-btn lms-btn--danger-text" style={{ flex: 1, border: '1px solid var(--color-border-strong)' }}>
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
