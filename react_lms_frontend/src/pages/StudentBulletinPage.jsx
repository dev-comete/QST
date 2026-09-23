import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { StudentQuizService } from '../api/studentQuiz.service';
import { notify } from '../lib/notify'; // Assurez-vous du bon chemin
import '../styles/index.css';

export default function StudentBulletinPage() {
  const { id } = useParams(); // L'ID de la vague
  const [bulletin, setBulletin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // 🌟 NOUVEAU : État pour le bouton de téléchargement
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    const fetchBulletin = async () => {
      try {
        const data = await StudentQuizService.getBulletin(id);
        setBulletin(data);
      } catch (err) {
        setError(err.response?.data?.error || "Erreur lors du chargement de votre bulletin.");
      } finally {
        setLoading(false);
      }
    };
    fetchBulletin();
  }, [id]);

  // 🌟 NOUVEAU : Fonction pour gérer le téléchargement du PDF
  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    try {
      // 1. On récupère le fichier binaire (Blob) depuis Axios
      const response = await StudentQuizService.downloadBulletinPDF(id);
      
      // 2. On vérifie comment votre interceptor Axios retourne les données
      // S'il retourne directement response.data, on l'utilise, sinon on utilise la réponse brute
      const blobData = response.data ? response.data : response; 
      
      // 3. Création d'un lien virtuel dans le navigateur
      const blob = new Blob([blobData], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Nom du fichier par défaut
      const filename = `Bulletin_${bulletin.apprenant.username}_${bulletin.vague.vague_nom}.pdf`;
      link.setAttribute('download', filename);
      
      // 4. On simule le clic pour lancer le téléchargement
      document.body.appendChild(link);
      link.click();
      
      // 5. Nettoyage
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      notify({ type: 'success', message: 'Téléchargement réussi !' });
    } catch (err) {
      console.error("Erreur PDF:", err);
      notify({ type: 'error', message: "Erreur lors de la génération du PDF." });
    } finally {
      setIsDownloading(false);
    }
  };

  if (loading) return <div className="lms-container lms-loading"><span className="lms-spinner" /> Génération du bulletin...</div>;
  if (error) return <div className="lms-container"><div className="lms-alert lms-alert--danger">{error}</div></div>;

  const resume = bulletin.resume_global;

  return (
    <div className="lms-scope lms-page">
      <div className="lms-container lms-container--md">
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-5)' }}>
          
          <Link to="/student/dashboard" className="lms-btn lms-btn--outline" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            Retour à mon espace
          </Link>

          <button 
            onClick={handleDownloadPDF} 
            disabled={isDownloading}
            className="lms-btn lms-btn--primary"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 24px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)', // Ombre élégante
              transition: 'transform 0.1s ease, box-shadow 0.1s ease',
              fontWeight: 600,
            }}
            onMouseOver={(e) => {
              if(!isDownloading) e.currentTarget.style.transform = 'translateY(-1px)';
              if(!isDownloading) e.currentTarget.style.boxShadow = '0 6px 8px -1px rgba(0, 0, 0, 0.15), 0 3px 6px -2px rgba(0, 0, 0, 0.1)';
            }}
            onMouseOut={(e) => {
              if(!isDownloading) e.currentTarget.style.transform = 'translateY(0)';
              if(!isDownloading) e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)';
            }}
          >
            {isDownloading ? (
              <>
                {/* Utilisation de votre spinner existant, adapté pour s'intégrer au bouton */}
                <span className="lms-spinner" style={{ width: '18px', height: '18px', borderBottomColor: 'white' }} />
                Génération en cours...
              </>
            ) : (
              <>
                {/* Icône SVG "Document Téléchargement" */}
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="12" y1="18" x2="12" y2="12"></line>
                  <polyline points="9 15 12 18 15 15"></polyline>
                </svg>
                Télécharger le bulletin (PDF)
              </>
            )}
          </button>
        </div>

        {/* EN-TÊTE DU BULLETIN */}
        <div className="lms-card lms-card--pad-lg" style={{ marginBottom: 'var(--space-6)', borderTop: '4px solid var(--color-primary)' }}>
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-5)' }}>
            <p className="lms-eyebrow">Bulletin de Notes Officiel</p>
            <h1 className="lms-pageheader__title" style={{ margin: 'var(--space-2) 0' }}>{bulletin.vague.formation} - {bulletin.vague.vague_nom}</h1>
            <p style={{ color: 'var(--color-text-muted)' }}>Apprenant : <strong>{bulletin.apprenant.username} </strong></p>
          </div>

          <div className="lms-grid lms-grid--3" style={{ textAlign: 'center', backgroundColor: 'var(--color-surface-hover)', borderRadius: 'var(--radius-md)', padding: 'var(--space-4)' }}>
            <div>
              <div style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>Moyenne Générale</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: resume.moyenne_generale_pct >= 50 ? 'var(--color-success)' : 'var(--color-danger)' }}>
                {resume.moyenne_generale_pct}%
              </div>
            </div>
            <div>
              <div style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>Score Total</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                {resume.total_score_obtenu} <span style={{ fontSize: '1rem', fontWeight: 'normal', color: 'var(--color-text-muted)' }}>/ {resume.total_score_possible}</span>
              </div>
            </div>
            <div>
              <div style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>Progression</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>
                {resume.progression}
              </div>
            </div>
          </div>
        </div>

        {/* DÉTAIL DES NOTES */}
        <div className="lms-card">
          <div className="lms-card__header">
            <h3 className="lms-card__title">Détail des évaluations</h3>
          </div>
          <div className="lms-card__body" style={{ padding: 0 }}>
            <table className="lms-table">
              <thead>
                <tr>
                  <th>Évaluation</th>
                  <th>Statut</th>
                  <th style={{ textAlign: 'right' }}>Note</th>
                  <th style={{ textAlign: 'right' }}>Pourcentage</th>
                </tr>
              </thead>
              <tbody>
                {bulletin.details_quizzes.map((quiz) => (
                  <tr key={quiz.quiz_id}>
                    <td className="lms-table__name">{quiz.quiz_titre}</td>
                    <td>
                      <span style={{ 
                        fontSize: 'var(--text-xs)', padding: '2px 8px', borderRadius: '12px', fontWeight: 600,
                        backgroundColor: quiz.statut === 'Terminé' ? 'rgba(16, 185, 129, 0.1)' : 'var(--color-surface-hover)',
                        color: quiz.statut === 'Terminé' ? 'var(--color-success)' : 'var(--color-text-muted)'
                      }}>
                        {quiz.statut}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {quiz.statut === 'Terminé' ? <strong>{quiz.score_obtenu} / {quiz.score_maximum}</strong> : '-'}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 'bold', color: quiz.pourcentage >= 50 ? 'var(--color-success)' : (quiz.statut === 'Terminé' ? 'var(--color-danger)' : 'inherit') }}>
                      {quiz.statut === 'Terminé' ? `${quiz.pourcentage}%` : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}