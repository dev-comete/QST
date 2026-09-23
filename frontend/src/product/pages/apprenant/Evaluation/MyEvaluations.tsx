import { useState, useEffect } from 'react';
import { QuizService } from '../../../../other/services/quizService';
import type { studentQuizType } from '../../../../other/types/quizType';
import BodyLayout from '../../../layout/common/BodyLayout';
import StudentQuizList from '../../../../system/organisms/evaluation/list/StudentQuizList';
import Box from '../../../../system/atoms/Container/Box';
import Loading from '../../../../system/atoms/Loading/Loading';
import FetchError from '../../../../system/atoms/Loading/FetchError';
import NavigationBar from '../../../../system/molecules/Navigation/NavigationBar';

export default function MyEvaluations() {
	const [quizzes, setQuizzes] = useState<studentQuizType[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');

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

	if (loading) return <Loading />

	if (error) return <FetchError />

	const quizzesAFaire = quizzes.filter(q => !q.termine);
	const quizzesTermines = quizzes.filter(q => q.termine);

	return (
		<BodyLayout
			title={"Mes évaluations"}
		>
			<Box direction='column' className='space-y-5'>
				<NavigationBar 
					titles={['Calendrier', 'Historique']}
				>
					<StudentQuizList data={quizzesAFaire}/>
					<StudentQuizList data={quizzesTermines}/>
				</NavigationBar>
			</Box>
		</BodyLayout>
	)
}
