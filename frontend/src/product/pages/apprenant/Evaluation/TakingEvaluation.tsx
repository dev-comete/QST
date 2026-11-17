import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router';
import { useAuth } from '../../../../other/hooks/auth/useAuth';
import { QuizService } from '../../../../other/services/quizService';
import type { AnswersMap, Question, QuizInfo } from '../../../../other/types/quizType';
import Box from '../../../../system/atoms/Container/Box';
import QuizQuestionBloc from '../../../../system/organisms/quiz/container/QuizQuestionBloc';
import BodyLayout from '../../../layout/common/BodyLayout';
import { QuizTimer } from '../../../../system/organisms/quiz/layout/QuizTimer';
import { parseDurationToMs } from '../../../../other/helper/helper';
import Loading from '../../../../system/atoms/Loading/Loading';
import FetchError from '../../../../system/atoms/Loading/FetchError';
import Paper from '../../../../system/atoms/Container/Paper';
import ConfirmActionButton from '../../../../system/molecules/Buttons/ConfirmActionButton';
import ModalQuizFinished from '../../../../system/organisms/evaluation/ModalQuizFinished';

export default function TakingEvaluation() {
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const vagueId = searchParams.get('vague_id') ?? '';

	const { authUser } = useAuth();
	const userId = authUser?.id ?? 'guest';

    // Create a unique key for local storage based on the quiz and vague ID
    const STORAGE_KEY = `qst_quiz_answers_${id}_${vagueId}_${userId}`;
	
    const [quizInfo, setQuizInfo] = useState<QuizInfo | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);

    // 1. Initialize answers from localStorage if available
    const [answers, setAnswers] = useState<AnswersMap>(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            return saved ? JSON.parse(saved) : {};
        } catch (error) {
            console.error("Failed to load answers from local storage", error);
            return {};
        }
    });

    // Un "Ref" pour toujours avoir accès aux dernières réponses dans le chronomètre
    const answersRef = useRef(answers);

    // Met à jour la référence et le localStorage dès que answers change
    useEffect(() => {
        answersRef.current = answers;
        
        // 2. Save to localStorage on every answer change
        try {
            if (id && vagueId) {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(answers));
            }
        } catch (error) {
            console.error("Failed to save answers to local storage", error);
        }
    }, [answers, id, vagueId, STORAGE_KEY]);

    const [loading, setLoading] = useState<boolean>(true);
    const [submitting, setSubmitting] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const [timeLeft, setTimeLeft] = useState<number | null>(null);
    const [scoreQuiz, setScoreQuiz] = useState<number | null>(null);

    const [open, setOpen] = useState(false)
    const navigate = useNavigate()

    const clearPersistedAnswers = () => {
        try {
            localStorage.removeItem(STORAGE_KEY);
        } catch (error) {
            console.error("Failed to clear local storage", error);
        }
    };

    // Fonction spéciale de soumission (hors cycle classique) quand le temps est écoulé
    const forceSubmitTimeout = async (): Promise<void> => {
        setSubmitting(true);
        try {
            const response = await QuizService.submitQuiz({
                quiz_id: id as string,
                vague_id: vagueId,
                answers: answersRef.current
            });
            setScoreQuiz(response.score_obtenu);
            
            // 3. Clear localStorage on automatic timeout submission
            clearPersistedAnswers();
            
            setOpen(true);
        } catch (err: unknown) {
            const apiError = err as { response?: { data?: { error?: string } } };
            setError(apiError.response?.data?.error || "Erreur lors de la soumission automatique.");
            setSubmitting(false);
        }
    };

    // 1. Chargement des données du Quiz et Chronomètre
    useEffect(() => {
        let timerId: number; 

        const fetchQuizData = async () => {
            try {
                if (!vagueId) {
                    throw new Error("L'ID de la vague est manquant dans l'URL.");
                }
                const data = (await QuizService.startQuiz(id as string, vagueId)) as QuizInfo;

                setQuizInfo(data);
                setQuestions(data.questions || []);

                // Only initialize empty arrays if localStorage was empty
                setAnswers(prev => {
                    const mergedAnswers = { ...prev };
                    let needsUpdate = false;
                    
                    data.questions.forEach((q: Question) => {
                        const qIdStr = String(q.question_id);
                        if (!mergedAnswers[qIdStr]) {
                            mergedAnswers[qIdStr] = [];
                            needsUpdate = true;
                        }
                    });
                    
                    if (needsUpdate) {
                        answersRef.current = mergedAnswers;
                        return mergedAnswers;
                    }
                    return prev;
                });

                const durationMs = parseDurationToMs(data.quiz_duree);
                let debutStr = data.heure_debut;
                const hadOffsetOrZ = debutStr.endsWith('Z') || debutStr.includes('+');
                if (!hadOffsetOrZ) debutStr += 'Z';

                const startTimeMs = new Date(debutStr).getTime();
                const endTimeMs = startTimeMs + durationMs;

                const updateTimer = () => {
                    const now = Date.now();
                    const remaining = endTimeMs - now;

                    if (remaining <= 0) {
                        setTimeLeft(0);
                        if (timerId) clearInterval(timerId); 
                        forceSubmitTimeout(); 
                    } else {
                        setTimeLeft(remaining);
                    }
                };

                updateTimer();
                timerId = window.setInterval(updateTimer, 1000);

            } catch (err: unknown) {
                const apiError = err as { response?: { data?: { error?: string } } };
                setError(apiError.response?.data?.error || "Erreur lors du chargement du quiz.");
            } finally {
                setLoading(false);
            }
        };

        fetchQuizData();

        return () => {
            if (timerId) clearInterval(timerId);
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, vagueId]);

    // 3. Soumission manuelle (Le bouton classique)
    const handleSubmitManually = async (): Promise<void> => {
        if (submitting) return;
        setSubmitting(true);
        try {
            const response = await QuizService.submitQuiz(({
                quiz_id: id as string,
                vague_id: vagueId,
                answers: answersRef.current 
            }));
            setScoreQuiz(response.score_obtenu);
            
            // 3. Clear localStorage on successful manual submission
            clearPersistedAnswers();
            
            setOpen(true);
        } catch (err: unknown) {
            const apiError = err as { response?: { data?: { error?: string } } };
            setError(apiError.response?.data?.error || "Erreur lors de la soumission du quiz.");
            setSubmitting(false);
        }
    };

    // 2. Gestion des clics sur les options (fourni au QuizQuestionBloc)
    const handleOptionToggle = (questionId: string | number, optionId: string | number, typeCode: string) => {
        setAnswers(prev => {
            const qid = String(questionId);
            const currentSelection = (prev[qid] ?? []) as Array<string | number>;

            if (typeCode === 'QCU') {
                return { ...prev, [qid]: [optionId] };
            }

            if (typeCode === 'OUV') {
                const value = String(optionId ?? '').trim();
                return { ...prev, [qid]: value ? [value] : [] };
            }

            if (currentSelection.includes(optionId)) {
                return { ...prev, [qid]: currentSelection.filter((id) => id !== optionId) };
            } else {
                return { ...prev, [qid]: [...currentSelection, optionId] };
            }
        });
    };

    const onViewResults = () => {
        navigate(`/quiz/${id}/revue?vague_id=${vagueId}`, {
            state: { fromQuiz: true },
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
                        btnColor='error'
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
            <ModalQuizFinished
                open={open}
                onViewResults={onViewResults}
                scoreQuiz={scoreQuiz ?? 0}
            />
        </BodyLayout>
    );
}