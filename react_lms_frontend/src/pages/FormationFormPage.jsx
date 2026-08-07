// src/pages/FormationFormPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FormationService } from '../api/formation.service';

export default function FormationFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState({
    nom_formation: '', 
  });

  useEffect(() => {
    if (isEditing) {
      FormationService.getById(id)
        .then(data => setFormData({ nom_formation: data.nom_formation }))
        .catch(err => console.error(err));
    }
  }, [id, isEditing]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await FormationService.update(id, formData);
      } else {
        // L'API assigne automatiquement le formateur et son organisation !
        await FormationService.create(formData);
      }
      navigate('/formations');
    } catch (error) {
      console.error("Erreur", error);
      alert("Erreur lors de l'enregistrement.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">
        {isEditing ? 'Modifier la Formation' : 'Créer une Formation'}
      </h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">Nom de la formation</label>
          <input 
            type="text" 
            name="nom_formation" 
            value={formData.nom_formation} 
            onChange={(e) => setFormData({ nom_formation: e.target.value })} 
            required 
            className="w-full border p-2 rounded"
          />
        </div>
        <div className="flex gap-4 pt-4">
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
            Enregistrer
          </button>
        </div>
      </form>
    </div>
  );
}