interface ScoreDisplayProps {
	score: number
	totalScore?: number
}

import React from 'react';
import CustomText from '../../atoms/Text/CustomText';
import Paper from '../../atoms/Container/Paper';
import Box from '../../atoms/Container/Box';

interface ScoreDisplayProps {
  score: number;
}

export const ScoreDisplay = ({ score }: ScoreDisplayProps) => {

	return (
		<Paper className='p-5'>
			<Box direction='column' className='items-center'>
				<CustomText textTag='h4'weight='bold' color='primary' className='uppercase border-b border-background pb-2 mb-5 w-full text-center'>Score total</CustomText>
				<CustomText textTag='h1' weight='bold'>{score} pts</CustomText>
			</Box>
		</Paper>
	);
};
