import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { VagueService } from '../api/vague.service';
import { UserService } from '../api/user.service';

export default function VagueDetailPage() {
  const { id } = useParams(); // Récupère l'ID de la vague dans l'URL
  
  const [vague, setVague] = useState(null);
  const [apprenantsDisponibles, setApprenantsDisponibles] = useState([]);
  const [selectedApprenantId, setSelectedApprenantId] = useState('');
  const [loading, setLoading] = useState(true);

  // Chargement des données initiales
  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      // 1. On récupère toutes les vagues et on cherche la nôtre 
      // (Si vous avez une route getById spécifique dans le backend, utilisez-la !)
      const vagues = await VagueService.getAll();
      const currentVague = vagues.find(v => v.id === parseInt(id));
      setVague(currentVague);

      // 2. On récupère les étudiants disponibles via notre nouveau UserService
      const apprenants = await UserService.getApprenants();
      setApprenantsDisponibles(apprenants);
      
    } catch (error) {
      console.error("Erreur de chargement", error);
    } finally {
      setLoading(false);
    }
  };

  // Action : Inscrire un étudiant
  const handleAssignStudent = async (e) => {
    e.preventDefault();
    if (!selectedApprenantId) return;

    try {
      // Appel à votre AssignStudentToVagueAPIView
      const response = await VagueService.assignStudent(id, selectedApprenantId);
      alert(response.message); // Ex: "Étudiant assigné. 3 quiz lui ont été assignés."
      
      // On rafraîchit la page pour voir le nouvel inscrit dans le tableau
      fetchData(); 
      setSelectedApprenantId(''); // On remet la liste déroulante à zéro
      
    } catch (error) {
      console.error("Erreur lors de l'inscription", error);
      alert(error.response?.data?.error || "Erreur lors de l'assignation");
    }
  };

  if (loading) return <div className="p-6">Chargement des détails de la vague...</div>;
  if (!vague) return <div className="p-6">Vague introuvable.</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* En-tête de la Vague */}
      <div className="bg-white p-6 rounded shadow-sm border mb-6">
        <h1 className="text-2xl font-bold mb-2">Formation : {vague.formation_nom}</h1>
        <p className="text-gray-600">
          Du {new Date(vague.debut).toLocaleDateString()} au {new Date(vague.fin).toLocaleDateString()}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Colonne de gauche : Formulaire d'ajout */}
        <div className="col-span-1 bg-white p-6 rounded shadow-sm border h-fit">
          <h2 className="text-lg font-bold mb-4">Inscrire un étudiant</h2>
          <form onSubmit={handleAssignStudent} className="flex flex-col gap-4">
            <select 
              className="border p-2 rounded"
              value={selectedApprenantId}
              onChange={(e) => setSelectedApprenantId(e.target.value)}
              required
            >
              <option value="">-- Choisir un apprenant --</option>
              {apprenantsDisponibles.map(apprenant => (
                <option key={apprenant.id} value={apprenant.id}>
                  {apprenant.username} ({apprenant.email})
                </option>
              ))}
            </select>
            <button 
              type="submit" 
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Ajouter à la vague
            </button>
          </form>
        </div>

        {/* Colonne de droite : Liste des inscrits (provenant de VagueListWithStudentsSerializer) */}
        <div className="col-span-2 bg-white p-6 rounded shadow-sm border">
          <h2 className="text-lg font-bold mb-4">Étudiants inscrits ({vague.etudiants.length})</h2>
          
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="py-2 px-3">Nom d'utilisateur</th>
                <th className="py-2 px-3">Email</th>
              </tr>
            </thead>
            <tbody>
              {vague.etudiants.length === 0 ? (
                <tr>
                  <td colSpan="2" className="py-4 text-center text-gray-500">
                    Aucun étudiant inscrit dans cette vague pour le moment.
                  </td>
                </tr>
              ) : (
                vague.etudiants.map(etudiant => (
                  <tr key={etudiant.etudiant_id} className="border-b">
                    <td className="py-2 px-3 font-medium">{etudiant.username}</td>
                    <td className="py-2 px-3 text-gray-600">{etudiant.email}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}