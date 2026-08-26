import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router';
import { QuizService } from '../../../other/services/quizService';

// Types for the quiz data structures
type Option = {
	id: number | string;
	reponse: string;
};

type Question = {
	question_id: number | string;
	enonce: string;
	options: Option[];
	type_question?: { code?: string } | string;
};

type QuizInfo = {
	quiz_titre?: string;
	quiz_duree: string | number | null;
	heure_debut: string;
	questions: Question[];
};

type AnswersMap = Record<string, Array<number | string>>;

// 🌟 CORRECTION 1 : Gère parfaitement le format DRF ("00:30:00", "1 02:30:00", "00:30:00.123")
const parseDurationToMs = (durationStr: string | number | null) => {
	if (durationStr === null || durationStr === undefined || durationStr === '') {
	console.warn('[QUIZ DEBUG] parseDurationToMs: durationStr is empty/null ->', durationStr);
	return 0;
  }

  // 🌟 CORRECTION 4 : Gère le format "300.0" (nombre pur = SECONDES).
  // C'est le format renvoyé par votre API pour quiz_duree (ex: "300.0", "45", "90.5").
  // On teste AVANT le format HH:MM:SS car il n'y a pas de ":" dans ce cas.
	const asString = String(durationStr);
	if (!asString.includes(':')) {
		const asNumber = parseFloat(asString);
	if (!isNaN(asNumber)) {
	  const result = asNumber * 1000; // secondes -> ms
	  console.log('[QUIZ DEBUG] parseDurationToMs OK (format numérique = secondes):', {
				input: durationStr,
		secondes: asNumber,
		resultMs: result,
		resultMinutes: result / 60000,
	  });
	  return result;
	}
	// Ni un nombre, ni un format HH:MM:SS -> vraiment inconnu
	console.error('[QUIZ DEBUG] parseDurationToMs: FORMAT NON RECONNU (pas de ":" et pas un nombre), retourne 0 !', {
	  input: durationStr,
	});
	return 0;
  }

  // Format DRF classique "HH:MM:SS" ou "D HH:MM:SS"
  let days = 0;
  let timeStr = durationStr;

	if (asString.includes(' ')) {
		const parts = asString.split(' ');
		days = parseInt(parts[0], 10) || 0;
		timeStr = parts[1];
  }
	const timeParts = timeStr.split(':');
  if (timeParts.length >= 3) {
	const hours = parseInt(timeParts[0], 10) || 0;
	const minutes = parseInt(timeParts[1], 10) || 0;
	const seconds = parseFloat(timeParts[2]) || 0;
	const result = (days * 86400 + hours * 3600 + minutes * 60 + seconds) * 1000;
	console.log('[QUIZ DEBUG] parseDurationToMs OK (format HH:MM:SS):', {
	  input: durationStr,
	  days,
	  hours,
	  minutes,
	  seconds,
	  resultMs: result,
	  resultMinutes: result / 60000,
	});
	return result;
  }

  // 🌟 DEBUG: si on arrive ici, le format n'a pas été reconnu -> durée = 0 -> quiz expire instantanément
  console.error('[QUIZ DEBUG] parseDurationToMs: FORMAT NON RECONNU, retourne 0 !', {
	input: durationStr,
	timeStr,
	timeParts,
  });
  return 0; // Si le format est inconnu
};

const formatTime = (ms: number) => {
  if (ms <= 0) return "00:00";
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

export default function Evaluation() {
	const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

	const [quizInfo, setQuizInfo] = useState<QuizInfo | null>(null);
	const [questions, setQuestions] = useState<Question[]>([]);

	const [answers, setAnswers] = useState<AnswersMap>({});
	// 🌟 CORRECTION 2 : Un "Ref" pour toujours avoir accès aux dernières réponses dans le chronomètre
	const answersRef = useRef<AnswersMap>({});

  // Met à jour la référence dès que answers change
  useEffect(() => {
	answersRef.current = answers;
  }, [answers]);

	const [loading, setLoading] = useState<boolean>(true);
	const [submitting, setSubmitting] = useState<boolean>(false);
	const [error, setError] = useState<string>('');

	const [timeLeft, setTimeLeft] = useState<number | null>(null);

  // 1. Chargement des données du Quiz et Chronomètre
  useEffect(() => {
	let timerId; // 🌟 Pour pouvoir arrêter la boucle infinie

		const fetchQuizData = async () => {
	  try {
				const data = (await QuizService.startEval(id as string)) as QuizInfo;

		// 🌟 DEBUG: inspecter la réponse brute de l'API AVANT tout traitement
		console.log('[QUIZ DEBUG] Réponse brute startQuiz():', data);
		console.log('[QUIZ DEBUG] data.heure_debut (raw):', JSON.stringify(data.heure_debut));
		console.log('[QUIZ DEBUG] data.quiz_duree (raw):', JSON.stringify(data.quiz_duree));
		console.log('[QUIZ DEBUG] typeof heure_debut:', typeof data.heure_debut);
		console.log('[QUIZ DEBUG] typeof quiz_duree:', typeof data.quiz_duree);

		setQuizInfo(data);
				setQuestions(data.questions || []);

				const initialAnswers: AnswersMap = {};
				data.questions.forEach((q: Question) => {
					initialAnswers[String(q.question_id)] = [];
				});
				setAnswers(initialAnswers);
				answersRef.current = initialAnswers;

		// Calcul du temps sécurisé
		const durationMs = parseDurationToMs(data.quiz_duree);

		// Sécurité timezone (ajoute le Z si Django envoie une date naïve pour la forcer en UTC)
		let debutStr = data.heure_debut;
		const hadOffsetOrZ = debutStr.endsWith('Z') || debutStr.includes('+');
		if (!hadOffsetOrZ) debutStr += 'Z';

		console.log('[QUIZ DEBUG] debutStr après ajout Z (si besoin):', debutStr, '| avait déjà un offset/Z ?', hadOffsetOrZ);

		const startTimeMs = new Date(debutStr).getTime();
		const endTimeMs = startTimeMs + durationMs;
		const nowMs = Date.now();

		// 🌟 DEBUG: LE LOG LE PLUS IMPORTANT — vérifie si le temps restant est déjà négatif AVANT même de démarrer le timer
		console.log('[QUIZ DEBUG] === CALCUL DU CHRONOMÈTRE ===', {
		  debutStr,
		  startTimeMs,
		  startTimeISO: new Date(startTimeMs).toISOString(),
		  durationMs,
		  durationMinutes: durationMs / 60000,
		  endTimeMs,
		  endTimeISO: new Date(endTimeMs).toISOString(),
		  nowMs,
		  nowISO: new Date(nowMs).toISOString(),
		  remainingMs: endTimeMs - nowMs,
		  remainingMinutes: (endTimeMs - nowMs) / 60000,
		  isAlreadyExpired: (endTimeMs - nowMs) <= 0,
		});

				if (isNaN(startTimeMs)) {
		  console.error('[QUIZ DEBUG] ATTENTION: startTimeMs est NaN ! La date "heure_debut" n\'a pas pu être parsée:', debutStr);
		}

				const updateTimer = () => {
		  const now = Date.now();
		  const remaining = endTimeMs - now;

		  // 🌟 DEBUG: log à chaque tick pour voir l'évolution (peut être commenté si trop verbeux)
		  console.log('[QUIZ DEBUG] tick updateTimer ->', {
			now,
			nowISO: new Date(now).toISOString(),
			remaining,
			remainingSeconds: Math.floor(remaining / 1000),
		  });

					if (remaining <= 0) {
			console.warn('[QUIZ DEBUG] remaining <= 0 -> déclenchement de forceSubmitTimeout()', {
			  remaining,
			  endTimeMs,
			  now,
			});
			setTimeLeft(0);
			if (timerId) clearInterval(timerId); // 🌟 CORRECTION 3 : STOPPE LA BOUCLE IMMÉDIATEMENT
			forceSubmitTimeout(); // Soumission avec la copie à jour
		  } else {
			setTimeLeft(remaining);
		  }
		};

		updateTimer();
		timerId = setInterval(updateTimer, 1000);

	  } catch (err) {
		console.error('[QUIZ DEBUG] Erreur dans fetchQuizData:', err);
		setError(err.response?.data?.error || "Erreur lors du chargement du quiz.");
	  } finally {
		setLoading(false);
	  }
	};

	fetchQuizData();

	// Nettoyage au démontage du composant
	return () => {
	  if (timerId) clearInterval(timerId);
	};
	// eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Fonction spéciale de soumission (hors cycle classique) quand le temps est écoulé
	const forceSubmitTimeout = async (): Promise<void> => {
		console.warn('[QUIZ DEBUG] forceSubmitTimeout() appelé - réponses envoyées:', answersRef.current);
		setSubmitting(true);
		try {
			const response = await QuizService.submitEval({ id: id, answers: answersRef.current});
			alert(`Temps écoulé ! Quiz soumis automatiquement.\n\nScore : ${response.score_obtenu} points.`);
			navigate('/student/dashboard');
		} catch (err: any) {
			console.error('[QUIZ DEBUG] Erreur dans forceSubmitTimeout:', err);
			setError(err?.response?.data?.error || "Erreur lors de la soumission automatique.");
			setSubmitting(false);
		}
	};

  // 2. Gestion des clics sur les options
	const handleOptionToggle = (questionId: number | string, optionId: number | string, typeCode: string) => {
		const qid = String(questionId);
		setAnswers(prev => {
			const currentSelection = prev[qid] || [];

			if (typeCode === 'QCU') {
				return { ...prev, [qid]: [optionId] };
			} else {
				if (currentSelection.includes(optionId)) {
					return { ...prev, [qid]: currentSelection.filter(id => id !== optionId) };
				} else {
					return { ...prev, [qid]: [...currentSelection, optionId] };
				}
			}
		});
	};

  // 3. Soumission manuelle (Le bouton classique)
	const handleSubmitManually = async (): Promise<void> => {
		if (submitting) return;

		const isConfirmed = window.confirm("Êtes-vous sûr de vouloir soumettre vos réponses ? Cette action est définitive.");
		if (!isConfirmed) return;

		console.log('[QUIZ DEBUG] handleSubmitManually() - réponses envoyées:', answers);
		setSubmitting(true);
		try {
			const response = await QuizService.submitEval({ id: id, answers: answersRef.current});
			alert(`Félicitations, quiz terminé !\n\nScore : ${response.score_obtenu} points.`);
			navigate('/student/dashboard');
		} catch (err: any) {
			console.error('[QUIZ DEBUG] Erreur dans handleSubmitManually:', err);
			setError(err?.response?.data?.error || "Erreur lors de la soumission du quiz.");
			setSubmitting(false);
		}
	};

  if (loading) {
	return (
	  <div className="lms-scope lms-page">
		<div className="lms-container lms-loading">
		  <span className="lms-spinner" />
		  Préparation de votre évaluation...
		</div>
	  </div>
	);
  }

  if (error) {
	return (
	  <div className="lms-scope lms-page">
		<div className="lms-container">
		  <div className="lms-empty">
			<p className="lms-empty__title">Information</p>
			<p>{error}</p>
			<button className="lms-btn lms-btn--primary" onClick={() => navigate('/student/dashboard')} style={{ marginTop: 'var(--space-4)' }}>
			  Retour à mon espace
			</button>
		  </div>
		</div>
	  </div>
	);
  }

  return (
	<div className="lms-scope lms-page">
	  <div className="lms-container lms-container--md">

		{/* EN-TÊTE FIXE DU QUIZ */}
		<div className="lms-card lms-card--pad-lg" style={{ position: 'sticky', top: '16px', zIndex: 10, marginBottom: 'var(--space-6)', borderTop: '4px solid var(--color-primary)' }}>
		  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
			<div>
			  <p className="lms-eyebrow" style={{ marginBottom: 'var(--space-2)' }}>Évaluation en cours</p>
			  <h1 className="lms-card__title" style={{ margin: 0 }}>{quizInfo?.quiz_titre || 'Quiz'}</h1>
			</div>

			{/* CHRONOMÈTRE */}
			<div style={{ textAlign: 'right' }}>
			  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
				Temps restant
			  </div>
			  <div style={{
				fontSize: 'var(--text-2xl)',
				fontWeight: 700,
								color: (timeLeft ?? 0) < 60000 ? 'var(--color-danger)' : 'var(--color-text)', // Rouge à 1 min
				fontVariantNumeric: 'tabular-nums'
			  }}>
								{formatTime(timeLeft ?? 0)}
			  </div>
			</div>
		  </div>
		</div>

		{/* LISTE DES QUESTIONS */}
				<div className="lms-stack" style={{ gap: 'var(--space-6)' }}>
					{questions.map((q: Question, index: number) => {
						const isQCU = typeof q.type_question === 'string' ? q.type_question === 'QCU' : q.type_question?.code === 'QCU';
						const qid = String(q.question_id);

						return (
							<div key={qid} className="lms-card">
				<div className="lms-card__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
				  <h3 className="lms-card__title">
					<span style={{ color: 'var(--color-text-muted)', marginRight: 'var(--space-2)' }}>Q{index + 1}.</span>
					{q.enonce}
				  </h3>
				</div>

				<div className="lms-card__body">
				  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-4)' }}>
					{isQCU ? "Sélectionnez une seule réponse." : "Sélectionnez une ou plusieurs réponses."}
				  </p>

									<div className="lms-stack" style={{ gap: 'var(--space-3)' }}>
										{q.options.map((opt: Option) => (
											<label
												key={String(opt.id)}
						style={{
						  display: 'flex',
						  alignItems: 'center',
						  padding: 'var(--space-3)',
						  border: '1px solid var(--color-border)',
						  borderRadius: 'var(--radius-md)',
						  cursor: 'pointer',
													backgroundColor: answers[qid]?.includes(opt.id) ? 'var(--color-surface-hover)' : 'transparent',
						  transition: 'background-color 0.2s'
						}}
					  >
						<input
						  type={isQCU ? "radio" : "checkbox"}
													name={`question_${qid}`}
													checked={answers[qid]?.includes(opt.id) || false}
													onChange={() => handleOptionToggle(q.question_id, opt.id, isQCU ? 'QCU' : 'QCM')}
						  style={{ marginRight: 'var(--space-3)', width: '18px', height: '18px' }}
						/>
						<span style={{ flex: 1 }}>{opt.reponse}</span>
					  </label>
					))}
				  </div>
				</div>
			  </div>
			);
		  })}
		</div>

		{/* BOUTON SOUMETTRE MANUEL */}
		<div style={{ marginTop: 'var(--space-8)', textAlign: 'right' }}>
		  <button
			className="lms-btn lms-btn--primary lms-btn--lg"
			onClick={handleSubmitManually}
			disabled={submitting}
		  >
			{submitting ? 'Envoi en cours...' : 'Soumettre mon évaluation'}
		  </button>
		</div>

	  </div>
	</div>
  );
}
