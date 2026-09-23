import React from 'react';
import type { ColorTheme } from '../../../other/types/common';

interface SpinnerProps {
	size?: 'sm' | 'md' | 'lg' | 'xl' | number;
	color?: ColorTheme
	className?: string;
}

const sizeMap = {
	sm: 'w-6 h-6',
	md: 'w-8 h-8',
	lg: 'w-10 h-10',
	xl: 'w-12 h-12',
};

export const Spinner: React.FC<SpinnerProps> = ({
	size = 'md',
	color = 'white',
	className = '',
}) => {
	const isNamedSize = typeof size === 'string' && size in sizeMap;
	const sizeClasses = isNamedSize ? sizeMap[size as keyof typeof sizeMap] : '';
	const customSizeStyle = typeof size === 'number' ? { width: `${size}px`, height: `${size}px` } : {};

	return (
		<div role="status" className={`inline-block ${className}`}>
			<svg
				className={`animate-spin ${sizeClasses} text-${color}`}
				style={customSizeStyle}
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
			>
			<circle
				className="opacity-25"
				cx="12"
				cy="12"
				r="10"
				stroke="currentColor"
				strokeWidth="4"
			/>
			<path
				className="opacity-75"
				fill="currentColor"
				d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
			/>
			</svg>
		</div>
	);
};

export default Spinner;