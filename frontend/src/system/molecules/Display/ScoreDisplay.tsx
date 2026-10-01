interface ScoreDisplayProps {
	score: number
	totalScore: number
}

import CustomText from '../../atoms/Text/CustomText';
import Paper from '../../atoms/Container/Paper';
import Box from '../../atoms/Container/Box';
import { PercentageRing } from './PercentRing';

interface ScoreDisplayProps {
	score: number;
	totalScore: number
}

export const ScoreDisplay = ({ score, totalScore }: ScoreDisplayProps) => {

	const scorePercent = Math.round(score / totalScore * 100)


	return (
		<Paper className='p-5'>
			<Box direction='column' className='items-center'>
				<CustomText
					textTag='h4'
					weight='bold'
					color='primary'
					className='uppercase border-b border-background pb-2 mb-5 w-full text-center'
				>Score</CustomText>
				<PercentageRing
					score={scorePercent}
					points={`${score}/${totalScore}pts`}
					size={150}
				/>
			</Box>
		</Paper>
	);
};
