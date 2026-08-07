import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { BaremeService } from '../api/bareme.service';

export default function BaremeFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState({
    pts: '',
  });

  useEffect(() => {
    if (isEditing) {
      BaremeService.getById(id)
        .then(data => setFormData(data))
        .catch(err => console.error("Erreur de chargement", err));
    }
  }, [id, isEditing]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await BaremeService.update(id, formData);
      } else {
        await BaremeService.create(formData);
      }
      navigate('/baremes');
    } catch (error) {
      console.error("Erreur lors de l'enregistrement", error);
      alert("Une erreur est survenue.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">
        {isEditing ? 'Modifier le Barème' : 'Créer un Barème'}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">Valeur (en points)</label>
          <input 
            type="number" 
            name="pts" 
            value={formData.pts} 
            onChange={handleChange} 
            required 
            step="0.1" // Permet les nombres décimaux (ex: 1.5, 0.5)
            min="0"
            className="w-full border p-2 rounded"
            placeholder="Ex: 2 ou 1.5"
          />
        </div>

        <div className="flex gap-4 pt-4">
          <button 
            type="submit" 
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Enregistrer
          </button>
          <button 
            type="button" 
            onClick={() => navigate('/baremes')}
            className="bg-gray-300 px-4 py-2 rounded"
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
}