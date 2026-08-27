import React from 'react';
import { formatTime } from '../../../../other/helper/helper';
// import Paper from "../../../atoms/Container/Paper";
// import CustomText from "../../../atoms/Text/CustomText";


interface TimerProps {
	timeLeft: number | null;
}

export const QuizTimer: React.FC<TimerProps> = ({ timeLeft }) => {

	if (!timeLeft)
		return null

	const isWarning = timeLeft ? timeLeft < 60000 : 0;

	return (
	<div className="text-right">
		<div className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-medium">
			Temps restant
		</div>
		<div
		className={`text-2xl font-bold tabular-nums transition-colors duration-200 ${
			isWarning
			? 'text-red-600 dark:text-red-500 animate-pulse'
			: 'text-slate-900 dark:text-slate-100'
		}`}
		>
		{formatTime(timeLeft)}
		</div>
	</div>
	);
};