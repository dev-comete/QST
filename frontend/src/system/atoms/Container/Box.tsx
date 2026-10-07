import type React from "react";

interface BoxProps {
	children: React.ReactNode;
	direction?: 'column' | 'row';
	className?: string;
	style?: React.CSSProperties;
}

const Box = ({
	children,
	direction = 'row',
	className,
	style
} : BoxProps) => {

	const flexDirection = direction === 'column' 
    ? "flex-col" 
    : "flex-col md:flex-row";

	return (
		<div
			className={`flex gap-2 ${flexDirection} ${className}`}
			style={style}
		>
			{children}
		</div>
	);
}

export default Box;