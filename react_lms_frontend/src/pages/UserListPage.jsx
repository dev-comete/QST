import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { UserService } from '../api/user.service';

export default function UserListPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await UserService.getAll();
      setUsers(data.results || data);
    } catch (error) {
      console.error("Erreur de chargement", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Voulez-vous vraiment supprimer cet utilisateur ?")) {
      try {
        await UserService.delete(id);
        setUsers(users.filter(u => u.id !== id));
      } catch (error) {
        console.error("Erreur lors de la suppression", error);
        alert("Erreur lors de la suppression.");
      }
    }
  };

  return (
    <div className="lms-scope">
      <div className="lms-page">
        <div className="lms-container">
          
          {/* En-tête de la page */}
          <div className="lms-pageheader">
            <div>
              <h1 className="lms-pageheader__title">Gestion des Utilisateurs</h1>
              <p className="lms-pageheader__subtitle">Gérez les accès administrateurs, formateurs et apprenants.</p>
            </div>
            <Link to="/users/create" className="lms-btn lms-btn--primary">
              + Nouvel Utilisateur
            </Link>
          </div>

          {/* État de chargement */}
          {loading ? (
            <div className="lms-loading">
              <div className="lms-spinner"></div>
              <span>Chargement des utilisateurs...</span>
            </div>
          ) : (
            /* Conteneur du tableau */
            <div className="lms-tablewrap">
              <table className="lms-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nom d'utilisateur</th>
                    <th>Email</th>
                    <th>Rôle</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="lms-table__empty">Aucun utilisateur trouvé.</td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr key={user.id}>
                        <td className="lms-table__id">#{user.id}</td>
                        <td className="lms-table__name">{user.username}</td>
                        <td>{user.email}</td>
                        <td>
                          {/* Vous pourriez utiliser lms-eyebrow ici pour le rôle */}
                          <span className="lms-eyebrow">Rôle {user.type_utilisateur}</span>
                        </td>
                        <td>
                          <div className="lms-table__actions">
                            <Link to={`/users/${user.id}/edit`} className="lms-btn lms-btn--link-text lms-btn--sm">
                              Modifier
                            </Link>
                            <button 
                              onClick={() => handleDelete(user.id)} 
                              className="lms-btn lms-btn--danger-text lms-btn--sm"
                            >
                              Supprimer
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
}