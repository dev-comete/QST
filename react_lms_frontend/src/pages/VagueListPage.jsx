import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { VagueService } from '../api/vague.service';
import { FormationService } from '../api/formation.service';
import '../styles/index.css';

const MOIS_OPTIONS = [
  { value: '01', label: 'Janvier' },
  { value: '02', label: 'Février' },
  { value: '03', label: 'Mars' },
  { value: '04', label: 'Avril' },
  { value: '05', label: 'Mai' },
  { value: '06', label: 'Juin' },
  { value: '07', label: 'Juillet' },
  { value: '08', label: 'Août' },
  { value: '09', label: 'Septembre' },
  { value: '10', label: 'Octobre' },
  { value: '11', label: 'Novembre' },
  { value: '12', label: 'Décembre' },
];

export default function VagueListPage() {
  const [vagues, setVagues] = useState([]);
  const [formations, setFormations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingFormations, setLoadingFormations] = useState(true);
  const navigate = useNavigate();

  // Filter state
  const [filters, setFilters] = useState({
    formation: '',
    mois: '',
    annee: '',
  });

  // Fetch formations once, for the filter dropdown
  useEffect(() => {
    const fetchFormations = async () => {
      try {
        const data = await FormationService.getAll();
        setFormations(data);
      } catch (error) {
        console.error("Erreur lors de la récupération des formations", error);
      } finally {
        setLoadingFormations(false);
      }
    };
    fetchFormations();
  }, []);

  // Fetch vagues whenever filters change
  const fetchVagues = useCallback(async () => {
    setLoading(true);
    try {
      // Only send non-empty params to the backend
      const activeFilters = Object.fromEntries(
        Object.entries(filters).filter(([, value]) => value !== '')
      );
      const data = await VagueService.getAll(activeFilters);
      setVagues(data);
    } catch (error) {
      console.error("Erreur lors de la récupération des vagues", error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchVagues();
  }, [fetchVagues]);

  const handleFilterChange = (field) => (e) => {
    setFilters((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleResetFilters = () => {
    setFilters({ formation: '', mois: '', annee: '' });
  };

  const hasActiveFilters = filters.formation || filters.mois || filters.annee;

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

        {/* Filters */}
        <div className="lms-filterbar">
          <div className="lms-filterbar__field">
            <label htmlFor="filter-formation" className="lms-filterbar__label">
              Formation
            </label>
            <select
              id="filter-formation"
              className="lms-select"
              value={filters.formation}
              onChange={handleFilterChange('formation')}
              disabled={loadingFormations}
            >
              <option value="">Toutes les formations</option>
              {formations.map((formation) => (
                <option key={formation.id} value={formation.id}>
                  {formation.nom_formation || formation.titre || `Formation #${formation.id}`}
                </option>
              ))}
            </select>
          </div>

          <div className="lms-filterbar__field">
            <label htmlFor="filter-mois" className="lms-filterbar__label">
              Mois de début
            </label>
            <select
              id="filter-mois"
              className="lms-select"
              value={filters.mois}
              onChange={handleFilterChange('mois')}
            >
              <option value="">Tous les mois</option>
              {MOIS_OPTIONS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          <div className="lms-filterbar__field">
            <label htmlFor="filter-annee" className="lms-filterbar__label">
              Année
            </label>
            <input
              id="filter-annee"
              type="number"
              className="lms-input"
              placeholder="ex : 2026"
              value={filters.annee}
              onChange={handleFilterChange('annee')}
              min="2000"
              max="2100"
            />
          </div>

          {hasActiveFilters && (
            <div className="lms-filterbar__field lms-filterbar__field--action">
              <button
                type="button"
                className="lms-btn lms-btn--ghost lms-btn--sm"
                onClick={handleResetFilters}
              >
                Réinitialiser
              </button>
            </div>
          )}
        </div>

        <div className="lms-tablewrap">
          {loading ? (
            <div className="lms-loading">
              <span className="lms-spinner" />
              Chargement des vagues…
            </div>
          ) : (
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
                      Aucune vague ne correspond à ces critères.
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
          )}
        </div>
      </div>
    </div>
  );
}