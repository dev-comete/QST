import React from 'react';

interface PercentageRingProps {
	score: number;
	size?: number;
	points?: string;
	strokeWidth?: number;
}

export const PercentageRing: React.FC<PercentageRingProps> = ({
	score,
	size = 120,
	strokeWidth = 10,
	points
}) => {
	const normalizedScore = Math.min(100, Math.max(0, score));
	const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (normalizedScore / 100) * circumference;

	// Dynamic color based on score
	const getColorClass = (val: number) => {
		if (val >= 80) return 'stroke-success text-success';
		if (val >= 50) return 'stroke-error text-error';
		return 'stroke-rose-500 text-rose-500';
	};

	const strokeColorClass = getColorClass(normalizedScore);

	return (
	<div
		className="relative inline-flex items-center justify-center font-sans"
		style={{ width: size, height: size }}
	>
		<svg width={size} height={size} className="rotate-[-90deg]">
		{/* Background Circle */}
		<circle
			cx={size / 2}
			cy={size / 2}
			r={radius}
			className="stroke-background"
			strokeWidth={strokeWidth}
			fill="transparent"
		/>
		{/* Animated Progress Circle */}
		<circle
			cx={size / 2}
			cy={size / 2}
			r={radius}
			className={`${strokeColorClass} transition-all duration-1000 ease-out`}
			strokeWidth={strokeWidth}
			strokeDasharray={circumference}
			strokeDashoffset={offset}
			strokeLinecap="round"
			fill="transparent"
		/>
		</svg>
		{/* Center Text */}
		<div className="absolute flex flex-col items-center justify-center text-center">
		<span className="text-2xl font-bold tracking-tight text-text">
			{Math.round(normalizedScore)}
			<span className="text-sm font-semibold">%</span>
		</span>
		<span className="text-[14px] font-medium tracking-wider text-text">
			{points}
		</span>
		</div>
	</div>
	);
};