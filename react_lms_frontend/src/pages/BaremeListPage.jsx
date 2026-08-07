import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BaremeService } from '../api/bareme.service';

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

  if (loading) return <div>Chargement des barèmes...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestion des Barèmes</h1>
        <Link 
          to="/baremes/create" 
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          + Nouveau Barème
        </Link>
      </div>

      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b">
            <th className="py-3 px-4">Points</th>
            <th className="py-3 px-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {baremes.length === 0 ? (
            <tr><td colSpan="2" className="py-4 text-center">Aucun barème trouvé.</td></tr>
          ) : (
            baremes.map((bareme) => (
              <tr key={bareme.id} className="border-b">
                <td className="py-3 px-4 font-medium">{bareme.pts} pts</td>
                <td className="py-3 px-4 flex gap-3">
                  <Link 
                    to={`/baremes/${bareme.id}/edit`} 
                    className="text-blue-600 hover:underline"
                  >
                    Modifier
                  </Link>
                  <button 
                    onClick={() => handleDelete(bareme.id)}
                    className="text-red-600 hover:underline"
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}