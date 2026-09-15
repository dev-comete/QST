import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { QuestionService } from '../api/question.service';
import { AssignmentService } from '../api/assignement.service';
import { AiService } from '../api/ia.service'; // 🌟 Import du service IA
import '../styles/index.css';
import { notify } from '../lib/notify';

export default function QuestionFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  // États des listes déroulantes
  const [types, setTypes] = useState([]);
  
  // État principal du formulaire
  const [formData, setFormData] = useState({
    enonce_question: '',
    type_id: '',
    bareme_pts: 1.0, 
    dossier_id: '' 
  });

  // État des options (réponses)
  const [options, setOptions] = useState([
    { id: Date.now(), reponse: '', est_correct: false, explication: '' },
    { id: Date.now() + 1, reponse: '', est_correct: false, explication: '' }
  ]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  // 🌟 État pour le chargement de l'IA
  const [isAiLoading, setIsAiLoading] = useState(false);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const typesData = await AssignmentService.getTypes();
        setTypes(typesData);

        if (isEditMode) {
          const questionData = await QuestionService.getQuestionById(id);
          
          const matchedType = typesData.find(t => 
            t.type_nom === questionData.type_nom || 
            t.type_question === questionData.type_nom ||
            t.type_utilisateur === questionData.type_nom
          );

          setFormData({
            enonce_question: questionData.enonce_question,
            type_id: matchedType ? matchedType.id : '',
            bareme_pts: 1.0 
          });

          if (questionData.reponses && questionData.reponses.length > 0) {
            setOptions(questionData.reponses.map(rep => ({
              id: rep.id,
              reponse: rep.texte, 
              est_correct: rep.est_correct,
              explication: rep.explication || ''
            })));
          } else {
            setOptions([]); 
          }
        }
      } catch (err) {
        setError("Impossible de charger les données.");
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, [id, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const selectedTypeObj = types.find(t => t.id === parseInt(formData.type_id));
  const selectedTypeCode = selectedTypeObj ? selectedTypeObj.code.toUpperCase() : '';

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
        return { ...opt, est_correct: opt.id === id };
      } else {
        if (opt.id === id) return { ...opt, est_correct: !opt.est_correct };
        return opt;
      }
    }));
  };

  const handleSuggestDistractors = async () => {
    if (!formData.enonce_question.trim()) {
      notify({ type: 'warning', message: "Veuillez d'abord saisir l'énoncé de la question." });
      return;
    }

    // 1. On récupère TOUTES les bonnes réponses saisies et cochées (via filter, et non plus find)
    const correctAnswers = options.filter(opt => opt.est_correct && opt.reponse.trim() !== '');
    
    if (correctAnswers.length === 0) {
      notify({ type: 'warning', message: "Veuillez d'abord saisir et cocher au moins une bonne réponse." });
      return;
    }

    // 2. On assemble toutes les bonnes réponses pour que l'IA connaisse tout le contexte
    // Ex: "Option 1 | Option 2"
    const bonnesReponsesTexte = correctAnswers.map(a => a.reponse).join(' | ');

    setIsAiLoading(true);
    try {
      // 3. On envoie toutes les bonnes réponses combinées à l'API
      const suggestions = await AiService.generateDistractors(formData.enonce_question, bonnesReponsesTexte);
      
      setOptions(prevOptions => {
        let updatedOptions = [...prevOptions];
        let suggestionsToPlace = [...suggestions]; 

        // 4. On remplace uniquement les fausses réponses (les vraies sont protégées)
        updatedOptions = updatedOptions.map(opt => {
          if (!opt.est_correct && suggestionsToPlace.length > 0) {
            const nextSuggestion = suggestionsToPlace.shift(); 
            return { ...opt, reponse: nextSuggestion };
          }
          return opt;
        });

        // 5. On ajoute le reste si nécessaire
        const extraOptions = suggestionsToPlace.map((sugg, index) => ({
          id: Date.now() + index + 100, 
          reponse: sugg,
          est_correct: false,
          explication: ''
        }));

        return [...updatedOptions, ...extraOptions];
      });

      notify({ type: 'success', message: 'Distracteurs générés et mis à jour avec succès !' });
      
    } catch (err) {
      console.error(err);
      const errorMsg = err.response?.data?.error || "Erreur lors de la génération par l'IA. Veuillez réessayer.";
      notify({ type: 'error', message: errorMsg });
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

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
      if (isEditMode) {
        const updatePayload = {
          enonce_question: formData.enonce_question,
          options: selectedTypeCode === 'OUV' ? [] : options.map(o => ({
            id: o.id.toString().length > 10 ? null : o.id, 
            texte: o.reponse, 
            est_correct: o.est_correct,
            explication: o.explication
          }))
        };
        await QuestionService.updateQuestion(id, updatePayload);
        notify({ type: 'success', message: 'Question modifiée avec succès !' });
      } else {
        const createPayload = {
          enonce_question: formData.enonce_question,
          type_id: parseInt(formData.type_id),
          bareme_pts: parseFloat(formData.bareme_pts),
          options: selectedTypeCode === 'OUV' ? [] : options.map(o => ({
            reponse: o.reponse,
            est_correct: o.est_correct,
            explication: o.explication
          }))
        };
        await QuestionService.createFullQuestion(createPayload);
        notify({ type: 'success', message: 'Question créée avec succès !' });
      }
      
      navigate('/banque-questions');
    } catch (err) {
      setError(err.response?.data?.error || "Erreur lors de la sauvegarde de la question.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="lms-container lms-loading"><span className="lms-spinner"/></div>;

  return (
    <div className="lms-scope lms-page">
      <div className="lms-container lms-container--md">
        
        <div className="lms-header-row" style={{ marginBottom: 'var(--space-6)' }}>
          <h1 className="lms-pageheader__title">
            {isEditMode ? 'Modifier la Question' : 'Créer une Question'}
          </h1>
          <button onClick={() => navigate('/banque-questions')} className="lms-btn lms-btn--outline">
            Annuler
          </button>
        </div>

        {error && <div className="lms-alert lms-alert--danger" style={{ marginBottom: 'var(--space-5)' }}>{error}</div>}

        <form onSubmit={handleSubmit} className="lms-stack" style={{ gap: 'var(--space-6)' }}>
          
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
                  disabled={isEditMode}
                  className="lms-select"
                >
                  <option value="" disabled>-- Choisir un type --</option>
                  {types.map(t => (
                    <option key={t.id} value={t.id}>{t.type_utilisateur || t.type_question}</option>
                  ))}
                </select>
                {isEditMode && (
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                    Le type ne peut pas être modifié.
                  </p>
                )}
              </div>

              {!isEditMode && (
                <div className="lms-field">
                  <label className="lms-label">Barème (Points) par défaut *</label>
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
              )}
            </div>
          </div>

          {selectedTypeCode && selectedTypeCode !== 'OUV' && (
            <div className="lms-card lms-card--pad-lg">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)', flexWrap: 'wrap', gap: '10px' }}>
                <h3 className="lms-card__title" style={{ margin: 0 }}>Options de réponse</h3>
                <div style={{ display: 'flex', gap: '10px' }}>
                  
                  {/* 🌟 NOUVEAU BOUTON IA */}
                  <button 
                    type="button" 
                    onClick={handleSuggestDistractors} 
                    disabled={isAiLoading}
                    className="lms-btn lms-btn--sm lms-btn--outline"
                    style={{ backgroundColor: 'var(--color-surface-hover)', borderColor: 'var(--color-border)' }}
                  >
                    {isAiLoading ? '✨ Génération...' : '✨ Suggérer avec l\'IA'}
                  </button>

                  <button type="button" onClick={handleAddOption} className="lms-btn lms-btn--sm lms-btn--outline">
                    + Ajouter une option
                  </button>
                </div>
              </div>
              
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-4)' }}>
                Cochez {selectedTypeCode === 'QCU' ? "la seule" : "les"} réponse(s) correcte(s) pour générer le corrigé automatique. (Saisissez d'abord une bonne réponse avant de solliciter l'IA).
              </p>

              <div className="lms-stack" style={{ gap: 'var(--space-4)' }}>
                {options.map((opt, index) => (
                  <div key={opt.id} style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'flex-start', padding: 'var(--space-4)', backgroundColor: opt.est_correct ? 'rgba(16, 185, 129, 0.05)' : 'var(--color-surface-hover)', border: opt.est_correct ? '1px solid var(--color-success)' : '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}>
                    
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
                        placeholder="Explication (affichée lors de la correction)" 
                        value={opt.explication}
                        onChange={(e) => handleOptionChange(opt.id, 'explication', e.target.value)}
                        className="lms-input"
                        style={{ fontSize: 'var(--text-sm)' }}
                        required={opt.est_correct} 
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

          {selectedTypeCode === 'OUV' && (
            <div className="lms-alert lms-alert--info">
              Les questions ouvertes ne nécessitent pas de propositions de réponses.
            </div>
          )}

          <div style={{ textAlign: 'right', marginTop: 'var(--space-2)' }}>
            <button type="submit" disabled={submitting} className="lms-btn lms-btn--primary lms-btn--lg">
              {submitting ? 'Sauvegarde en cours...' : (isEditMode ? 'Enregistrer les modifications' : 'Créer la question')}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}