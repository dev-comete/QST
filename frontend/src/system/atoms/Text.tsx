import type React from "react";

type TextType = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span';

interface TextProps {
	children: React.ReactNode;
	type?: TextType;
	color?: string;
}

const textStyling : Record<TextType, string> = {
	'h1': 'text-2xl font-bold',
	'h2': 'text-xl font-bold',
	'h3': 'text-lg font-bold',
	'h4': 'text-md font-bold',
	'h5': 'text-sm font-bold',
	'h6': 'text-xs font-bold',
	'p': 'text-base',
	'span': 'text-base'
};

const Text = ({children, type : Tag = "p", color}: TextProps) => {

	if (textStyling[Tag] === undefined)
		return <p className="text-base">{children}</p>;
	
	const classStyling = `${textStyling[Tag]} text-${color}`;

	return (
		<Tag className={classStyling}>
			{children}
		</Tag>
	)
}

export default Text;
