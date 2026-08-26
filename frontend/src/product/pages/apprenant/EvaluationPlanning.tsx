import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { QuizService } from '../../../other/services/quizService';
import type { studentQuizType } from '../../../other/types/quizType';
import BodyLayout from '../../layout/common/BodyLayout';
import StudentQuizList from '../../../system/molecules/List/StudentQuizList';
import CustomText from '../../../system/atoms/Text/CustomText';
import Box from '../../../system/atoms/Container/Box';
import Paper from '../../../system/atoms/Container/Paper';

export default function EvaluationPlanning() {
	const [quizzes, setQuizzes] = useState<studentQuizType[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const navigate = useNavigate();

	useEffect(() => {
	const fetchDashboardData = async () => {
		try {
		const result = await QuizService.evalList();
			setQuizzes(result);
		} catch {
			setError("Impossible de charger votre espace.");
		} finally {
			setLoading(false);
		}
	};

	fetchDashboardData();
	}, []);

	if (loading) {
	return (
		<div className="lms-scope lms-page">
			<div className="lms-container lms-loading">
				<span className="lms-spinner" />
				Chargement de votre espace...
			</div>
		</div>
	);
	}

	const quizzesAFaire = quizzes.filter(q => !q.termine);
	const quizzesTermines = quizzes.filter(q => q.termine);

	return (
		<BodyLayout
			title={"Espace étudiant"}
		>
			<Box direction='column' className='space-y-5'>
				<Box direction='column' className='items-center'>
					<Paper color='white' className='p-5 w-full'>
						<CustomText textTag='h3'weight='bold'>Quiz à faire</CustomText>
					</Paper>
					<StudentQuizList data={quizzesAFaire}/>
				</Box>
				<Box direction='column' className='items-center'>
					<Paper color='white' className='p-5 w-full'>
						<CustomText textTag='h3'weight='bold'>Quiz terminés</CustomText>
					</Paper>
					<StudentQuizList data={quizzesTermines}/>
				</Box>
			</Box>
		</BodyLayout>
	)
}