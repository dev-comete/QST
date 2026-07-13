import type React from "react";

interface BoxProps {
	children: React.ReactNode;
	direction?: 'column' | 'row';
	property?: string;
}

const Box = ({
	children,
	direction = 'row',
	property
} : BoxProps) => {

	const flexDirection = direction === 'column' ? "flex-col" : "flex-row";

	return (
		<div
			className={`flex ${flexDirection} gap-5 ${property}`}
		>{children}</div>		
	)
}

export default Box;