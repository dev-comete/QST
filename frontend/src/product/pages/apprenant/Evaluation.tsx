import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router';
import { QuizService } from '../../../other/services/quizService';
import type { AnswersMap, Question, QuizInfo } from '../../../other/types/quizType';
import Box from '../../../system/atoms/Container/Box';
import QuizQuestionBloc from '../../../system/organisms/quiz/container/QuizQuestionBloc';
import BodyLayout from '../../layout/common/BodyLayout';
import ActionButton from '../../../system/molecules/Buttons/ActionButton';
import { QuizTimer } from '../../../system/organisms/quiz/layout/QuizTimer';
import { parseDurationToMs } from '../../../other/helper/helper';
import Loading from '../../../system/atoms/Loading/Loading';
import FetchError from '../../../system/atoms/Loading/FetchError';

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
		// console.log('[QUIZ DEBUG] Réponse brute startQuiz():', data);
		// console.log('[QUIZ DEBUG] data.heure_debut (raw):', JSON.stringify(data.heure_debut));
		// console.log('[QUIZ DEBUG] data.quiz_duree (raw):', JSON.stringify(data.quiz_duree));
		// console.log('[QUIZ DEBUG] typeof heure_debut:', typeof data.heure_debut);
		// console.log('[QUIZ DEBUG] typeof quiz_duree:', typeof data.quiz_duree);

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

		// console.log('[QUIZ DEBUG] debutStr après ajout Z (si besoin):', debutStr, '| avait déjà un offset/Z ?', hadOffsetOrZ);

		const startTimeMs = new Date(debutStr).getTime();
		const endTimeMs = startTimeMs + durationMs;
		const nowMs = Date.now();

		// 🌟 DEBUG: LE LOG LE PLUS IMPORTANT — vérifie si le temps restant est déjà négatif AVANT même de démarrer le timer
		// console.log('[QUIZ DEBUG] === CALCUL DU CHRONOMÈTRE ===', {
		//   debutStr,
		//   startTimeMs,
		//   startTimeISO: new Date(startTimeMs).toISOString(),
		//   durationMs,
		//   durationMinutes: durationMs / 60000,
		//   endTimeMs,
		//   endTimeISO: new Date(endTimeMs).toISOString(),
		//   nowMs,
		//   nowISO: new Date(nowMs).toISOString(),
		//   remainingMs: endTimeMs - nowMs,
		//   remainingMinutes: (endTimeMs - nowMs) / 60000,
		//   isAlreadyExpired: (endTimeMs - nowMs) <= 0,
		// });

		// 		if (isNaN(startTimeMs)) {
		//   console.error('[QUIZ DEBUG] ATTENTION: startTimeMs est NaN ! La date "heure_debut" n\'a pas pu être parsée:', debutStr);
		// }

				const updateTimer = () => {
		  const now = Date.now();
		  const remaining = endTimeMs - now;

		  // 🌟 DEBUG: log à chaque tick pour voir l'évolution (peut être commenté si trop verbeux)
		//   console.log('[QUIZ DEBUG] tick updateTimer ->', {
		// 	now,
		// 	nowISO: new Date(now).toISOString(),
		// 	remaining,
		// 	remainingSeconds: Math.floor(remaining / 1000),
		//   });

					if (remaining <= 0) {
			// console.warn('[QUIZ DEBUG] remaining <= 0 -> déclenchement de forceSubmitTimeout()', {
			//   remaining,
			//   endTimeMs,
			//   now,
			// });
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
		// console.error('[QUIZ DEBUG] Erreur dans fetchQuizData:', err);
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
		// console.warn('[QUIZ DEBUG] forceSubmitTimeout() appelé - réponses envoyées:', answersRef.current);
		setSubmitting(true);
		try {
			const response = await QuizService.submitEval({ id: id, answers: answersRef.current});
			alert(`Temps écoulé ! Quiz soumis automatiquement.\n\nScore : ${response.score_obtenu} points.`);
			navigate('/student/dashboard');
		} catch (err: any) {
			// console.error('[QUIZ DEBUG] Erreur dans forceSubmitTimeout:', err);
			setError(err?.response?.data?.error || "Erreur lors de la soumission automatique.");
			setSubmitting(false);
		}
	};

  // 3. Soumission manuelle (Le bouton classique)
	const handleSubmitManually = async (): Promise<void> => {
		if (submitting) return;

		const isConfirmed = window.confirm("Êtes-vous sûr de vouloir soumettre vos réponses ? Cette action est définitive.");
		if (!isConfirmed) return;

		// console.log('[QUIZ DEBUG] handleSubmitManually() - réponses envoyées:', answers);
		setSubmitting(true);
		try {
			const response = await QuizService.submitEval({ id: id, answers: answersRef.current});
			alert(`Félicitations, quiz terminé !\n\nScore : ${response.score_obtenu} points.`);
			navigate('/student/dashboard');
		} catch (err: any) {
			// console.error('[QUIZ DEBUG] Erreur dans handleSubmitManually:', err);
			setError(err?.response?.data?.error || "Erreur lors de la soumission du quiz.");
			setSubmitting(false);
		}
	};

	if (loading) return <Loading />

	if (error) return <FetchError />

	return (
		<BodyLayout title={`Evaluation - ${quizInfo?.quiz_titre}`}>
			<Box direction='column' className='space-y-5 items-center min-h-0'>
				<QuizTimer timeLeft={timeLeft}/>
				<QuizQuestionBloc questions={questions}/> 
				<ActionButton
					action={handleSubmitManually}
				>
					Soumettre l'évaluation
				</ActionButton>			
			</Box>
		</BodyLayout>
	);
}
