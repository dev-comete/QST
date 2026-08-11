import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { VagueService } from '../api/vague.service';
import { FormationService } from '../api/formation.service';

// 🌟 Importation du calendrier et de son CSS
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '../styles/index.css';

export default function VagueFormPage() {
  const navigate = useNavigate();
  const [formations, setFormations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Note : debut et fin sont maintenant initialisés à null (pour le DatePicker)
  const [formData, setFormData] = useState({
    formation_id: '',
    debut: null,
    fin: null
  });

  useEffect(() => {
    FormationService.getAll()
      .then(data => {
        setFormations(data);
        if (data.length > 0) {
          setFormData(prev => ({ ...prev, formation_id: data[0].id }));
        }
      })
      .catch(err => console.error("Erreur", err))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Vérification de sécurité côté front
    if (!formData.debut || !formData.fin) {
      alert("Veuillez sélectionner les dates de début et de fin.");
      return;
    }

    try {
      // Les objets Date sont automatiquement convertis au format ISO standard par Axios
      await VagueService.create(formData.formation_id, formData.debut, formData.fin);
      navigate('/vagues');
    } catch (error) {
      console.error("Erreur", error);
      alert(error.response?.data?.fin || "Vérifiez que la date de fin est après la date de début.");
    }
  };

  return (
    <div className="lms-scope lms-page lms-page--narrow">
      <div className="lms-container--md" style={{ width: '100%' }}>
        <h1 className="lms-pageheader__title" style={{ marginBottom: 'var(--space-6)' }}>
          Créer une nouvelle vague
        </h1>

        <form onSubmit={handleSubmit} className="lms-card lms-card--pad-lg">

          {/* Choix de la formation */}
          <div className="lms-field">
            <label className="lms-label">Formation concernée</label>
            <select
              name="formation_id"
              value={formData.formation_id}
              onChange={(e) => setFormData({ ...formData, formation_id: e.target.value })}
              required
              disabled={loading}
              className="lms-select"
            >
              <option value="">-- Sélectionnez une formation --</option>
              {formations.map(form => (
                <option key={form.id} value={form.id}>
                  {form.nom_formation}
                </option>
              ))}
            </select>
          </div>

          {/* Date de début (Nouveau Calendrier) */}
          <div className="lms-field">
            <label className="lms-label">Date et heure de début</label>
            <DatePicker
              selected={formData.debut}
              onChange={(date) => setFormData({ ...formData, debut: date })}
              showTimeSelect
              timeFormat="HH:mm"
              timeIntervals={15} // L'heure saute de 15 min en 15 min (ex: 10:00, 10:15)
              dateFormat="dd/MM/yyyy à HH:mm"
              placeholderText="Sélectionnez le début"
              required
            />
          </div>

          {/* Date de fin (Nouveau Calendrier) */}
          <div className="lms-field">
            <label className="lms-label">Date et heure de fin</label>
            <DatePicker
              selected={formData.fin}
              onChange={(date) => setFormData({ ...formData, fin: date })}
              showTimeSelect
              timeFormat="HH:mm"
              timeIntervals={15}
              dateFormat="dd/MM/yyyy à HH:mm"
              placeholderText="Sélectionnez la fin"
              minDate={formData.debut} // 🌟 SÉCURITÉ : Bloque les dates antérieures au début !
              required
            />
          </div>

          <div className="lms-form-actions">
            <button type="submit" className="lms-btn lms-btn--primary">
              Créer la vague
            </button>
            <button type="button" onClick={() => navigate('/vagues')} className="lms-btn lms-btn--outline">
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
