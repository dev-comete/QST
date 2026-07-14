import type React from "react";

interface BoxProps {
	children: React.ReactNode;
	direction?: 'column' | 'row';
	customStyling?: string;
}

const Box = ({
	children,
	direction = 'row',
	customStyling
} : BoxProps) => {

	const flexDirection = direction === 'column' ? "flex-col" : "flex-row";

	return (
		<div
			className={`flex ${flexDirection} gap-5 ${customStyling}`}
		>{children}</div>		
	)
}

export default Box;