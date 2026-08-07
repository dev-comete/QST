import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { VagueService } from '../api/vague.service';
import { UserService } from '../api/user.service';
import { QuizService } from '../api/quiz.service'; 

export default function VagueDetailPage() {
  const { id } = useParams();
  
  const [vague, setVague] = useState(null);
  const [apprenantsDisponibles, setApprenantsDisponibles] = useState([]);
  const [selectedApprenantId, setSelectedApprenantId] = useState('');
  
  // 🌟 Nouveaux états pour les Quiz
  const [quizzesDisponibles, setQuizzesDisponibles] = useState([]);
  const [selectedQuizId, setSelectedQuizId] = useState('');
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      // 1. Récupération de la Vague
      const vagues = await VagueService.getAll();
      const currentVague = vagues.find(v => v.id === parseInt(id));
      setVague(currentVague);

      // 2. Récupération des Apprenants
      const apprenants = await UserService.getApprenants();
      setApprenantsDisponibles(apprenants);

      // 🌟 3. Récupération des Quiz du formateur
      // (On gère le cas où l'API renvoie des données paginées avec .results)
      const quizzes = await QuizService.getQuizzes(); // Adaptez le nom de la méthode si besoin
      const listeQuizzes = quizzes.results || quizzes;
      setQuizzesDisponibles(listeQuizzes);
      
    } catch (error) {
      console.error("Erreur de chargement", error);
    } finally {
      setLoading(false);
    }
  };

  // --- ACTIONS ---

  const handleAssignStudent = async (e) => {
    e.preventDefault();
    if (!selectedApprenantId) return;

    try {
      const response = await VagueService.assignStudent(id, selectedApprenantId);
      alert(response.message); 
      fetchData(); 
      setSelectedApprenantId(''); 
    } catch (error) {
      console.error("Erreur lors de l'inscription", error);
      alert(error.response?.data?.error || "Erreur lors de l'assignation");
    }
  };

  // 🌟 NOUVELLE ACTION : Assigner le Quiz
  const handleAssignQuiz = async (e) => {
    e.preventDefault();
    if (!selectedQuizId) return;

    try {
      const response = await VagueService.assignQuiz(id, selectedQuizId);
      alert(response.message); // Ex: "Succès ! Le quiz a été assigné à X étudiants."
      setSelectedQuizId(''); // On réinitialise la liste déroulante
    } catch (error) {
      console.error("Erreur d'assignation du quiz", error);
      // Le backend renverra une erreur si le quiz ne fait pas partie de la même formation
      const errorMsg = error.response?.data?.non_field_errors?.[0] || error.response?.data?.error || "Impossible d'assigner ce quiz.";
      alert(errorMsg);
    }
  };

  if (loading) return <div className="p-6">Chargement des détails de la vague...</div>;
  if (!vague) return <div className="p-6">Vague introuvable.</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* En-tête */}
      <div className="bg-white p-6 rounded shadow-sm border mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold mb-2">Formation : {vague.formation_nom}</h1>
          <p className="text-gray-600 font-medium">
            Du {new Date(vague.debut).toLocaleDateString()} au {new Date(vague.fin).toLocaleDateString()}
          </p>
        </div>
        <div className="bg-blue-50 text-blue-800 px-4 py-2 rounded-lg font-bold">
          {vague.etudiants.length} inscrit(s)
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Colonne de gauche : Formulaires d'actions */}
        <div className="col-span-1 flex flex-col gap-6">
          
          {/* Action 1 : Inscrire un étudiant */}
          <div className="bg-white p-6 rounded shadow-sm border">
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
              <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
                Ajouter à la vague
              </button>
            </form>
          </div>

          {/* 🌟 Action 2 : Assigner un Quiz massif */}
          <div className="bg-white p-6 rounded shadow-sm border border-l-4 border-l-green-500">
            <h2 className="text-lg font-bold mb-2">Assigner un Quiz</h2>
            <p className="text-xs text-gray-500 mb-4">
              Ce quiz sera assigné à <strong>tous les étudiants</strong> actuellement inscrits dans cette vague.
            </p>
            <form onSubmit={handleAssignQuiz} className="flex flex-col gap-4">
              <select 
                className="border p-2 rounded"
                value={selectedQuizId}
                onChange={(e) => setSelectedQuizId(e.target.value)}
                required
              >
                <option value="">-- Choisir un quiz --</option>
                {quizzesDisponibles.map(quiz => (
                  <option key={quiz.id} value={quiz.id}>
                    Quiz #{quiz.id} {quiz.status === 'draft' ? '(Brouillon)' : ''}
                  </option>
                ))}
              </select>
              <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition">
                Assigner à toute la classe
              </button>
            </form>
          </div>

        </div>

        {/* Colonne de droite : Liste des inscrits */}
        <div className="col-span-2 bg-white p-6 rounded shadow-sm border">
          <h2 className="text-lg font-bold mb-4">Étudiants inscrits dans la session</h2>
          
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
                  <td colSpan="2" className="py-8 text-center text-gray-500">
                    Aucun étudiant inscrit dans cette vague pour le moment.
                  </td>
                </tr>
              ) : (
                vague.etudiants.map(etudiant => (
                  <tr key={etudiant.etudiant_id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-3 font-medium">{etudiant.username}</td>
                    <td className="py-3 px-3 text-gray-600">{etudiant.email}</td>
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