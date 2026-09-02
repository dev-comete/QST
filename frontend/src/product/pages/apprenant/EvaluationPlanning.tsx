import { useState, useEffect } from 'react';
import { QuizService } from '../../../other/services/quizService';
import type { studentQuizType } from '../../../other/types/quizType';
import BodyLayout from '../../layout/common/BodyLayout';
import StudentQuizList from '../../../system/molecules/List/StudentQuizList';
import CustomText from '../../../system/atoms/Text/CustomText';
import Box from '../../../system/atoms/Container/Box';
import Paper from '../../../system/atoms/Container/Paper';
import Loading from '../../../system/atoms/Loading/Loading';
import FetchError from '../../../system/atoms/Loading/FetchError';

interface EvaluationNavProps {
	title : string, 
	isClicked: boolean,
	onClick: () => void
}

const EvaluationNav = ({ title, isClicked, onClick } : EvaluationNavProps) => {

	const baseStyle = 'flex justify-center w-full cursor-pointer hover:brightness-90 active:brightness-75 rounded-lg p-5'

	return (
		<div
			onClick={onClick}
			className={`${baseStyle} ${isClicked ? 'bg-secondary' : ''}`}>
			<CustomText weight='bold' color={`${isClicked ? 'text' : 'disabled'}`}>{title}</CustomText>
		</div>
	)
}

export default function EvaluationPlanning() {
	const [quizzes, setQuizzes] = useState<studentQuizType[]>([]);
	const [loading, setLoading] = useState(true);
	const [ isDone, setIsDone ] = useState(false)
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
				<Paper className='flex w-full justify-between'>
					<EvaluationNav 
						title='Calendrier'
						isClicked={!isDone}
						onClick={() => setIsDone(false)}
					/>
					<EvaluationNav 
						title='Historique'
						isClicked={isDone}
						onClick={() => setIsDone(true)}
					/>
				</Paper>
				<Box direction='column' className='items-center'>
				{ isDone ? <StudentQuizList data={quizzesTermines}/>
					:  <StudentQuizList data={quizzesAFaire}/>
				}
				</Box>
			</Box>
		</BodyLayout>
	)
}