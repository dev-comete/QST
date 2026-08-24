import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { QuestionService } from '../api/question.service';
import { AssignmentService } from '../api/assignement.service'; 
import '../styles/index.css';

export default function QuestionFormPage() {
  const navigate = useNavigate();

  // États des listes déroulantes
  const [types, setTypes] = useState([]);
  
  // État principal du formulaire
  const [formData, setFormData] = useState({
    enonce_question: '',
    type_id: '',
    bareme_pts: 1.0,
    dossier_id: '' // Optionnel, si vous implémentez les dossiers plus tard
  });

  // État des options (réponses)
  const [options, setOptions] = useState([
    { id: Date.now(), reponse: '', est_correct: false, explication: '' },
    { id: Date.now() + 1, reponse: '', est_correct: false, explication: '' }
  ]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const typesData = await AssignmentService.getTypes();
        setTypes(typesData);
      } catch (err) {
        setError("Impossible de charger les types de questions.");
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  // -- GESTION DU FORMULAIRE DE BASE --
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Récupérer le code système du type sélectionné (ex: "QCU", "QCM", "OUV")
  const selectedTypeObj = types.find(t => t.id === parseInt(formData.type_id));
  const selectedTypeCode = selectedTypeObj ? selectedTypeObj.code.toUpperCase() : '';

  // -- GESTION DES OPTIONS DYNAMIQUES --
  const handleAddOption = () => {
    setOptions(prev => [...prev, { id: Date.now(), reponse: '', est_correct: false, explication: '' }]);
  };

  const handleRemoveOption = (id) => {
    setOptions(prev => prev.filter(opt => opt.id !== id));
  };

  const handleOptionChange = (id, field, value) => {
    setOptions(prev => prev.map(opt => {
      if (opt.id !== id) return opt;
      return { ...opt, [field]: value };
    }));
  };

  const handleCorrectToggle = (id) => {
    setOptions(prev => prev.map(opt => {
      if (selectedTypeCode === 'QCU') {
        // En QCU, une seule bonne réponse possible : on désélectionne les autres
        return { ...opt, est_correct: opt.id === id };
      } else {
        // En QCM, on inverse juste la valeur cliquée
        if (opt.id === id) return { ...opt, est_correct: !opt.est_correct };
        return opt;
      }
    }));
  };

  // -- SOUMISSION --
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    // Validation front-end rapide
    if (selectedTypeCode !== 'OUV' && options.length < 2) {
      setError("Il faut au moins 2 options de réponse pour un QCM/QCU.");
      setSubmitting(false);
      return;
    }

    const correctCount = options.filter(o => o.est_correct).length;
    if (selectedTypeCode === 'QCU' && correctCount !== 1) {
      setError("Un QCU doit avoir exactement UNE bonne réponse.");
      setSubmitting(false);
      return;
    }
    if (selectedTypeCode === 'QCM' && correctCount < 1) {
      setError("Un QCM doit avoir au moins UNE bonne réponse.");
      setSubmitting(false);
      return;
    }

    try {
      // Préparation du payload exact attendu par CreateFullQuestionSerializer
      const payload = {
        enonce_question: formData.enonce_question,
        type_id: parseInt(formData.type_id),
        bareme_pts: parseFloat(formData.bareme_pts),
        options: selectedTypeCode === 'OUV' ? [] : options.map(o => ({
          reponse: o.reponse,
          est_correct: o.est_correct,
          explication: o.explication
        }))
      };

      // Appel à votre endpoint (assurez-vous d'avoir la méthode dans QuestionService)
      await QuestionService.createFullQuestion(payload);
      
      alert("Question créée avec succès !");
      navigate('/banque-questions'); // Retour à la banque
    } catch (err) {
      setError(err.response?.data?.error || "Erreur lors de la création de la question.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="lms-container lms-loading"><span className="lms-spinner"/></div>;

  return (
    <div className="lms-scope lms-page">
      <div className="lms-container lms-container--md">
        
        <div className="lms-header-row" style={{ marginBottom: 'var(--space-6)' }}>
          <h1 className="lms-pageheader__title">Créer une Question</h1>
          <button onClick={() => navigate('/banque-questions')} className="lms-btn lms-btn--outline">
            Annuler
          </button>
        </div>

        {error && <div className="lms-alert lms-alert--danger" style={{ marginBottom: 'var(--space-5)' }}>{error}</div>}

        <form onSubmit={handleSubmit} className="lms-stack" style={{ gap: 'var(--space-6)' }}>
          
          {/* BLOC 1 : INFORMATIONS DE BASE */}
          <div className="lms-card lms-card--pad-lg">
            <h3 className="lms-card__title" style={{ marginBottom: 'var(--space-4)' }}>Informations générales</h3>
            
            <div className="lms-field">
              <label className="lms-label">Énoncé de la question *</label>
              <textarea 
                name="enonce_question"
                value={formData.enonce_question}
                onChange={handleChange}
                required
                className="lms-input"
                rows="3"
                placeholder="Ex: Quelle est la capitale de Madagascar ?"
              />
            </div>

            <div className="lms-grid lms-grid--2">
              <div className="lms-field">
                <label className="lms-label">Type de question *</label>
                <select 
                  name="type_id" 
                  value={formData.type_id} 
                  onChange={handleChange} 
                  required 
                  className="lms-select"
                >
                  <option value="" disabled>-- Choisir un type --</option>
                  {types.map(t => (
                    <option key={t.id} value={t.id}>{t.type_utilisateur || t.type_question}</option>
                  ))}
                </select>
              </div>

              <div className="lms-field">
                <label className="lms-label">Barème (Points) *</label>
                <input 
                  type="number" 
                  name="bareme_pts" 
                  value={formData.bareme_pts} 
                  onChange={handleChange} 
                  required 
                  min="0.1" 
                  step="0.1"
                  className="lms-input" 
                />
              </div>
            </div>
          </div>

          {/* BLOC 2 : GESTION DES OPTIONS (Désactivé si question ouverte) */}
          {selectedTypeCode && selectedTypeCode !== 'OUV' && (
            <div className="lms-card lms-card--pad-lg">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
                <h3 className="lms-card__title" style={{ margin: 0 }}>Options de réponse</h3>
                <button type="button" onClick={handleAddOption} className="lms-btn lms-btn--sm lms-btn--outline">
                  + Ajouter une option
                </button>
              </div>
              
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-4)' }}>
                Cochez {selectedTypeCode === 'QCU' ? "la seule" : "les"} réponse(s) correcte(s) pour générer le corrigé automatique.
              </p>

              <div className="lms-stack" style={{ gap: 'var(--space-4)' }}>
                {options.map((opt, index) => (
                  <div key={opt.id} style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'flex-start', padding: 'var(--space-4)', backgroundColor: opt.est_correct ? 'rgba(16, 185, 129, 0.05)' : 'var(--color-surface-hover)', border: opt.est_correct ? '1px solid var(--color-success)' : '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}>
                    
                    {/* Checkbox / Radio pour "est_correct" */}
                    <div style={{ paddingTop: 'var(--space-2)' }}>
                      <input 
                        type={selectedTypeCode === 'QCU' ? "radio" : "checkbox"} 
                        checked={opt.est_correct}
                        onChange={() => handleCorrectToggle(opt.id)}
                        style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                      />
                    </div>

                    <div style={{ flex: 1 }} className="lms-stack">
                      <input 
                        type="text" 
                        placeholder={`Option ${index + 1}`} 
                        value={opt.reponse}
                        onChange={(e) => handleOptionChange(opt.id, 'reponse', e.target.value)}
                        required
                        className="lms-input" 
                      />
                      <input 
                        type="text" 
                        placeholder="Explication (affichée lors de la correction) - Optionnel" 
                        value={opt.explication}
                        onChange={(e) => handleOptionChange(opt.id, 'explication', e.target.value)}
                        className="lms-input"
                        style={{ fontSize: 'var(--text-sm)' }}
                      />
                    </div>

                    <button type="button" onClick={() => handleRemoveOption(opt.id)} className="lms-btn lms-btn--ghost" style={{ color: 'var(--color-danger)' }}>
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MESSAGE POUR QUESTION OUVERTE */}
          {selectedTypeCode === 'OUV' && (
            <div className="lms-alert lms-alert--info">
              Les questions ouvertes ne nécessitent pas de propositions de réponses. La correction sera effectuée manuellement par le formateur.
            </div>
          )}

          <div style={{ textAlign: 'right', marginTop: 'var(--space-2)' }}>
            <button type="submit" disabled={submitting} className="lms-btn lms-btn--primary lms-btn--lg">
              {submitting ? 'Création en cours...' : 'Sauvegarder la question'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}