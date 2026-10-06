import React from 'react';
import { formatTime } from '../../../../other/helper/helper';
import CustomText from '../../../atoms/Text/CustomText';
import Paper from '../../../atoms/Container/Paper';
import Box from '../../../atoms/Container/Box';
import FAIcon from '../../../atoms/Icon/FAIcon';

interface TimerProps {
	timeLeft: number | null;
}

export const QuizTimer: React.FC<TimerProps> = ({ timeLeft }) => {

	if (!timeLeft)
		return null

	const isWarning = timeLeft ? timeLeft < 60000 : 0;

	return (
	<Paper className='p-5'>
		<Box className='space-x-1 items-center'>
			<FAIcon name='clock' size='lg'/>
			<CustomText textTag='h2' weight='bold'>Temps restant : </CustomText>
			<CustomText textTag='h2' weight='bold' color={isWarning ? 'error' : 'primary'}>{formatTime(timeLeft)}</CustomText>
		</Box>
	</Paper>
	);
};