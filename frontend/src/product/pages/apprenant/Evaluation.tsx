import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router';
import { QuizService } from '../../../other/services/quizService';
import type { AnswersMap, Question, QuizInfo } from '../../../other/types/quizType';
import Box from '../../../system/atoms/Container/Box';
import QuizQuestionBloc from '../../../system/organisms/quiz/container/QuizQuestionBloc';
import BodyLayout from '../../layout/common/BodyLayout';
import { QuizTimer } from '../../../system/organisms/quiz/layout/QuizTimer';
import { parseDurationToMs } from '../../../other/helper/helper';
import Loading from '../../../system/atoms/Loading/Loading';
import FetchError from '../../../system/atoms/Loading/FetchError';
import Paper from '../../../system/atoms/Container/Paper';
import ConfirmActionButton from '../../../system/molecules/Buttons/ConfirmActionButton';

export default function Evaluation() {
	const { id } = useParams();
	const navigate = useNavigate();
  
	const [quizInfo, setQuizInfo] = useState<QuizInfo | null>(null);
	const [questions, setQuestions] = useState<Question[]>([]);
  
	const [answers, setAnswers] = useState<AnswersMap>({});
	// 🌟 CORRECTION 2 : Un "Ref" pour toujours avoir accès aux dernières réponses dans le chronomètre
	const answersRef = useRef({});
  
	// Met à jour la référence dès que answers change
	useEffect(() => {
	  answersRef.current = answers;
	}, [answers]);

	const [loading, setLoading] = useState<boolean>(true);
	const [submitting, setSubmitting] = useState<boolean>(false);
	const [error, setError] = useState<string>('');

	const [timeLeft, setTimeLeft] = useState<number | null>(null);

	// Fonction spéciale de soumission (hors cycle classique) quand le temps est écoulé
	const forceSubmitTimeout = async (): Promise<void> => {
		// console.warn('[QUIZ DEBUG] forceSubmitTimeout() appelé - réponses envoyées:', answersRef.current);
		setSubmitting(true);
		try {
			const response = await QuizService.submitQuiz({ quiz_id: id as string, answers: answersRef.current as AnswersMap[]});
			alert(`Temps écoulé ! Quiz soumis automatiquement.\n\nScore : ${response.score_obtenu} points.`);
			navigate('/');
		} catch (err: any) {
			// console.error('[QUIZ DEBUG] Erreur dans forceSubmitTimeout:', err);
			setError(err?.response?.data?.error || "Erreur lors de la soumission automatique.");
			setSubmitting(false);
		}
	};

  // 1. Chargement des données du Quiz et Chronomètre
  useEffect(() => {
	let timerId : number; // 🌟 Pour pouvoir arrêter la boucle infinie

		const fetchQuizData = async () => {
	  try {
				const data = (await QuizService.startQuiz(id as string)) as QuizInfo;

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
		// const nowMs = Date.now();

				const updateTimer = () => {
		  const now = Date.now();
		  const remaining = endTimeMs - now;


					if (remaining <= 0) {

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



  // 3. Soumission manuelle (Le bouton classique)
	const handleSubmitManually = async (): Promise<void> => {
		if (submitting) return;
		// console.log('[QUIZ DEBUG] handleSubmitManually() - réponses envoyées:', answers);
		setSubmitting(true);
		try {
			const response = await QuizService.submitQuiz(({
				quiz_id: id as string,
				answers: answersRef.current as AnswersMap[]
			}));
			alert(`Félicitations, quiz terminé !\n\nScore : ${response.score_obtenu} points.`);
			navigate('/');
		} catch (err: any) {
			// console.error('[QUIZ DEBUG] Erreur dans handleSubmitManually:', err);
			setError(err?.response?.data?.error || "Erreur lors de la soumission du quiz.");
			setSubmitting(false);
		}
	};

	// 2. Gestion des clics sur les options (fourni au QuizQuestionBloc)
	const handleOptionToggle = (questionId: string | number, optionId: string | number, typeCode: string) => {
		setAnswers(prev => {
			const qid = String(questionId);
			const currentSelection = (prev[qid] as any) || [];

			if (typeCode === 'QCU') {
				return { ...prev, [qid]: [optionId] };
			} else {
				if (currentSelection.includes(optionId)) {
					return { ...prev, [qid]: currentSelection.filter((id: any) => id !== optionId) };
				} else {
					return { ...prev, [qid]: [...currentSelection, optionId] };
				}
			}
		});
	};

	if (loading) return <Loading />

	if (error) return <FetchError />

	return (
		<BodyLayout
			title={`Evaluation - ${quizInfo?.quiz_titre}`}
			titleButton={<QuizTimer timeLeft={timeLeft}/>}
			footer={
				<Paper color='white' className='p-3 w-full flex flex-col items-center'>
					<ConfirmActionButton
						action={handleSubmitManually}
					>
						Soumettre l'évaluation
					</ConfirmActionButton>
				</Paper>
			}
		>
			<Box direction='column' className='space-y-5 items-center'>
				<QuizQuestionBloc
					questions={questions}
					answers={answers}
					onToggle={handleOptionToggle}
				/> 
			</Box>
		</BodyLayout>
	);
}
