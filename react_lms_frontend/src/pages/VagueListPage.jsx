import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { VagueService } from '../api/vague.service';

export default function VagueListPage() {
  const [vagues, setVagues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVagues();
  }, []);

  const fetchVagues = async () => {
    try {
      const data = await VagueService.getAll();
      setVagues(data);
    } catch (error) {
      console.error("Erreur lors de la récupération des vagues", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-6">Chargement des vagues...</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestion des Vagues (Sessions)</h1>
        {/* On préparera ce bouton plus tard si vous voulez une page de création */}
        <Link 
        to="/vagues/create" 
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
        + Nouvelle Vague
        </Link>
      </div>

      <div className="bg-white rounded shadow-sm border overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="py-3 px-4">ID</th>
              <th className="py-3 px-4">Formation</th>
              <th className="py-3 px-4">Date de début</th>
              <th className="py-3 px-4">Date de fin</th>
              <th className="py-3 px-4">Inscrits</th>
              <th className="py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {vagues.length === 0 ? (
              <tr>
                <td colSpan="6" className="py-8 text-center text-gray-500">
                  Aucune vague n'a été trouvée.
                </td>
              </tr>
            ) : (
              vagues.map((vague) => (
                <tr key={vague.id} className="border-b hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4 text-gray-500">#{vague.id}</td>
                  <td className="py-3 px-4 font-medium">{vague.formation_nom}</td>
                  <td className="py-3 px-4">{new Date(vague.debut).toLocaleDateString()}</td>
                  <td className="py-3 px-4">{new Date(vague.fin).toLocaleDateString()}</td>
                  <td className="py-3 px-4">
                    <span className="bg-blue-100 text-blue-800 py-1 px-2 rounded-full text-sm">
                      {vague.etudiants?.length || 0} apprenants
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <Link 
                      to={`/vagues/${vague.id}`} 
                      className="text-blue-600 hover:underline font-medium"
                    >
                      Gérer les inscriptions
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}