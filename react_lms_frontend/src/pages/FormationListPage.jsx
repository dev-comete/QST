import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FormationService } from '../api/formation.service';

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

  if (loading) return <div>Chargement...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Mes Formations</h1>
        <Link to="/formations/create" className="bg-blue-600 text-white px-4 py-2 rounded">
          + Nouvelle Formation
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {formations.length === 0 ? (
          <p>Aucune formation trouvée.</p>
        ) : (
          formations.map((formation) => (
            <div key={formation.id} className="border p-4 rounded shadow-sm bg-white">
              <p className="text-xl font-bold mb-2">{formation.nom_formation}</p>
              
              <div className="flex justify-between text-sm">
                <Link to={`/formations/${formation.id}/edit`} className="text-blue-600 hover:underline">
                  Modifier
                </Link>
                <button onClick={() => handleDelete(formation.id)} className="text-red-600 hover:underline">
                  Supprimer
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}