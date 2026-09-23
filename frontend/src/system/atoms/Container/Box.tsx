import type React from "react";

interface BoxProps {
	children: React.ReactNode;
	direction?: 'column' | 'row';
	className?: string;
}

const Box = ({
	children,
	direction = 'row',
	className
} : BoxProps) => {

	const flexDirection = direction === 'column' ? "flex-col" : "flex-row";

	return (
		<div
			className={`flex ${flexDirection} gap-2 ${className}`}
		>{children}</div>		
	)
}

export default Box;