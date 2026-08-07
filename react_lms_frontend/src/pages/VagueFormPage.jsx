import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { VagueService } from '../api/vague.service';
import { FormationService } from '../api/formation.service';

// 🌟 Importation du calendrier et de son CSS
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

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
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Créer une nouvelle Vague</h1>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded shadow-sm border">
        
        {/* Choix de la formation */}
        <div>
          <label className="block mb-1 font-medium">Formation concernée</label>
          <select 
            name="formation_id" 
            value={formData.formation_id} 
            onChange={(e) => setFormData({ ...formData, formation_id: e.target.value })} 
            required 
            className="w-full border p-2 rounded"
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
        <div>
          <label className="block mb-1 font-medium">Date et heure de début</label>
          <DatePicker
            selected={formData.debut}
            onChange={(date) => setFormData({ ...formData, debut: date })}
            showTimeSelect
            timeFormat="HH:mm"
            timeIntervals={15} // L'heure saute de 15 min en 15 min (ex: 10:00, 10:15)
            dateFormat="dd/MM/yyyy à HH:mm"
            placeholderText="Sélectionnez le début"
            className="w-full border p-2 rounded" // Garde votre style Tailwind !
            required
          />
        </div>

        {/* Date de fin (Nouveau Calendrier) */}
        <div>
          <label className="block mb-1 font-medium">Date et heure de fin</label>
          <DatePicker
            selected={formData.fin}
            onChange={(date) => setFormData({ ...formData, fin: date })}
            showTimeSelect
            timeFormat="HH:mm"
            timeIntervals={15}
            dateFormat="dd/MM/yyyy à HH:mm"
            placeholderText="Sélectionnez la fin"
            minDate={formData.debut} // 🌟 SÉCURITÉ : Bloque les dates antérieures au début !
            className="w-full border p-2 rounded"
            required
          />
        </div>

        <div className="flex gap-4 pt-4">
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Créer la vague
          </button>
          <button type="button" onClick={() => navigate('/vagues')} className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400">
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
}