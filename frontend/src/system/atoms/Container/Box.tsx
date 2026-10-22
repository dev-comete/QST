import type React from "react";

interface BoxProps {
	children: React.ReactNode;
	direction?: 'column' | 'row';
	flexDirection?: string,
	className?: string;
	style?: React.CSSProperties;
}

const Box = ({
	children,
	direction = 'row',
	flexDirection,
	className,
	style
} : BoxProps) => {

	const dirClass = flexDirection ?? (direction === 'row' ? 'flex-row' : 'flex-col');

	return (
		<div
			className={`flex gap-2 ${dirClass} ${className}`}
			style={style}
		>
			{children}
		</div>
	);
}

export default Box;