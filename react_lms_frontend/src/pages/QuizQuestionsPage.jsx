import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { QuizService } from '../api/quiz.service';
import '../styles/index.css';

// Icônes inline (traits fins, cohérentes avec le reste du design system —
// remplacent les emojis ✅ ❌ 💡 par des glyphes vectoriels sobres).
const IconCheck = (props) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="m8.5 12.5 2.5 2.5 4.5-5" />
  </svg>
);

const IconX = (props) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="m9.5 9.5 5 5m0-5-5 5" />
  </svg>
);

const IconHint = (props) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M9 18h6" />
    <path d="M10 22h4" />
    <path d="M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.3 1 2.3h6c0-1 .4-1.8 1-2.3A7 7 0 0 0 12 2Z" />
  </svg>
);

export default function QuizQuestionsPage() {
  const { id } = useParams(); // ID du quiz
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const data = await QuizService.getAssignedQuestions(id);
        setQuestions(data);
      } catch (err) {
        console.error(err);
        setError("Impossible de charger les questions de ce quiz.");
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [id]);

  if (loading) {
    return (
      <div className="lms-scope lms-page">
        <div className="lms-container lms-loading">
          <span className="lms-spinner" />
          Chargement des questions...
        </div>
      </div>
    );
  }

  return (
    <div className="lms-scope lms-page">
      <div className="lms-container lms-container--md">

        {/* EN-TÊTE */}
        <div className="lms-header-row" style={{ marginBottom: 'var(--space-6)' }}>
          <div>
            <h1 className="lms-pageheader__title">Questions du Quiz #{id}</h1>
            <p className="lms-pageheader__subtitle">
              Total : {questions.length} question(s) assignée(s)
            </p>
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            <Link to="/quizzes" className="lms-btn lms-btn--outline">
              Retour
            </Link>
            <Link to={`/quizzes/${id}/assign`} className="lms-btn lms-btn--primary">
              + Assigner des questions
            </Link>
          </div>
        </div>

        {error && <div className="lms-alert lms-alert--danger" style={{ marginBottom: 'var(--space-5)' }}>{error}</div>}

        {/* LISTE DES QUESTIONS */}
        {questions.length === 0 ? (
          <div className="lms-empty">
            <p className="lms-empty__title">Aucune question</p>
            <p>Ce quiz est vide. Cliquez sur « Assigner des questions » pour commencer.</p>
          </div>
        ) : (
          <div className="lms-stack" style={{ gap: 'var(--space-6)' }}>
            {questions.map((q, index) => (
              <div key={q.id} className="lms-card">

                {/* En-tête de la question */}
                <div
                  className="lms-card__header"
                  style={{
                    alignItems: 'flex-start',
                    borderBottom: '1px solid var(--color-border)',
                    paddingBottom: 'var(--space-4)',
                    marginBottom: 'var(--space-4)'
                  }}
                >
                  <h3 className="lms-card__title" style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: 'var(--text-md)' }}>
                    <span className="lms-eyebrow" style={{ marginRight: 'var(--space-2)' }}>Q{index + 1}.</span>
                    {q.enonce_question}
                  </h3>

                  {/* Badges Type et Points */}
                  <div style={{ display: 'flex', gap: 'var(--space-2)', flexShrink: 0 }}>
                    <span className="lms-badge lms-badge--neutral">{q.type_nom}</span>
                    <span className="lms-badge lms-badge--success lms-num">{q.points} pts</span>
                  </div>
                </div>

                {/* Options de réponse */}
                <div className="lms-stack" style={{ gap: 'var(--space-3)' }}>
                  {q.options.map((opt) => (
                    <div
                      key={opt.reponse_id}
                      className={`lms-answer ${opt.est_correct ? 'lms-answer--correct' : 'lms-answer--incorrect'}`}
                      style={{
                        borderLeft: opt.est_correct ? '3px solid var(--color-success)' : '3px solid var(--color-border-strong)',
                        borderRadius: '0 var(--radius-sm) var(--radius-sm) 0'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                        {opt.est_correct
                          ? <IconCheck style={{ color: 'var(--color-success-strong)', flexShrink: 0 }} />
                          : <IconX style={{ color: 'var(--color-slate-light)', flexShrink: 0 }} />}
                        <strong style={{ fontWeight: opt.est_correct ? 600 : 400 }}>{opt.texte}</strong>
                      </div>

                      {/* Affichage de l'explication si elle existe */}
                      {opt.explication && (
                        <div
                          className="lms-answer__explain"
                          style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: 'var(--space-2)',
                            marginTop: 'var(--space-2)',
                            marginLeft: 'calc(16px + var(--space-3))',
                          }}
                        >
                          <IconHint style={{ marginTop: '2px', flexShrink: 0, color: 'var(--color-slate-light)' }} />
                          <span>{opt.explication}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
