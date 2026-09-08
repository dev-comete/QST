import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { VagueService } from '../api/vague.service';
import { FormationService } from '../api/formation.service';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '../styles/index.css';
import { notify } from '../lib/notify';

export default function VagueFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [formations, setFormations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [evaluationsEnCours, setEvaluationsEnCours] = useState(false);

  const [formData, setFormData] = useState({
    nom_vague: '', // 🌟 NOUVEAU
    formation_id: '',
    debut: null,
    fin: null
  });

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const formationsData = await FormationService.getAll();
        setFormations(formationsData);

        if (isEditMode) {
          const vagueData = await VagueService.getById(id);
          setFormData({
            nom_vague: vagueData.nom_vague || '', // 🌟 NOUVEAU
            formation_id: vagueData.formation, 
            debut: new Date(vagueData.debut),
            fin: new Date(vagueData.fin)
          });
          setEvaluationsEnCours(vagueData.a_des_evaluations_en_cours || false);
        } else if (formationsData.length > 0) {
          setFormData(prev => ({ ...prev, formation_id: formationsData[0].id }));
        }
      } catch (err) {
        console.error("Erreur", err);
        notify({ type: 'error', message: "Erreur lors du chargement des données." });
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [id, isEditMode]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.debut || !formData.fin) {
      notify({ type: 'error', message: 'Veuillez sélectionner les dates de début et de fin.' });
      return;
    }

    try {
      if (isEditMode) {
        await VagueService.updateVague(id, formData);
        notify({ type: 'success', message: 'Vague modifiée avec succès.' });
      } else {
        await VagueService.create(formData.nom_vague, formData.formation_id, formData.debut, formData.fin);
        notify({ type: 'success', message: 'Vague créée avec succès.' });
      }
      navigate('/vagues');
    } catch (error) {
      console.error("Erreur", error);
      notify({ 
        type: 'error', 
        message: error.response?.data?.error || error.response?.data?.fin || "Vérifiez que la date de fin est après la date de début." 
      });
    }
  };

  return (
    <div className="lms-scope lms-page lms-page--narrow">
      <div className="lms-container--md" style={{ width: '100%' }}>
        <h1 className="lms-pageheader__title" style={{ marginBottom: 'var(--space-6)' }}>
          {isEditMode ? 'Modifier la session' : 'Créer une nouvelle session'}
        </h1>

        <form onSubmit={handleSubmit} className="lms-card lms-card--pad-lg">

          {/* 🌟 NOUVEAU : Champ Nom de la Vague */}
          <div className="lms-field">
            <label className="lms-label">Nom de la session / vague *</label>
            <input
              type="text"
              name="nom_vague"
              value={formData.nom_vague}
              onChange={(e) => setFormData({ ...formData, nom_vague: e.target.value })}
              required
              className="lms-input"
              placeholder="Ex: Promotion Janvier 2026"
            />
          </div>

          {/* Choix de la formation */}
          <div className="lms-field">
            <label className="lms-label">Formation concernée *</label>
            <select
              name="formation_id"
              value={formData.formation_id}
              onChange={(e) => setFormData({ ...formData, formation_id: e.target.value })}
              required
              disabled={loading || isEditMode}
              className="lms-select"
            >
              <option value="">-- Sélectionnez une formation --</option>
              {formations.map(form => (
                <option key={form.id} value={form.id}>
                  {form.nom_formation}
                </option>
              ))}
            </select>
            {isEditMode && (
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                La formation ne peut pas être modifiée une fois la vague créée.
              </p>
            )}
          </div>

          <div className="lms-field">
            <label className="lms-label">Date et heure de début *</label>
            <DatePicker
              selected={formData.debut}
              onChange={(date) => setFormData({ ...formData, debut: date })}
              showTimeSelect
              timeFormat="HH:mm"
              timeIntervals={15}
              dateFormat="dd/MM/yyyy à HH:mm"
              placeholderText="Sélectionnez le début"
              required
              disabled={evaluationsEnCours}
            />
            {evaluationsEnCours && (
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-warning)', marginTop: '4px' }}>
                La date de début est verrouillée car des apprenants ont déjà commencé leurs évaluations.
              </p>
            )}
          </div>

          <div className="lms-field">
            <label className="lms-label">Date et heure de fin *</label>
            <DatePicker
              selected={formData.fin}
              onChange={(date) => setFormData({ ...formData, fin: date })}
              showTimeSelect
              timeFormat="HH:mm"
              timeIntervals={15}
              dateFormat="dd/MM/yyyy à HH:mm"
              placeholderText="Sélectionnez la fin"
              minDate={formData.debut}
              required
            />
          </div>

          <div className="lms-form-actions">
            <button type="submit" disabled={loading} className="lms-btn lms-btn--primary">
              {isEditMode ? 'Enregistrer les modifications' : 'Créer la vague'}
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