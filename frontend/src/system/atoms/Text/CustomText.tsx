import type React from "react";
import type { ColorTheme } from "../../../other/types/common";

type TextType = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span';

type TextWeight = 'light' | 'normal' | 'bold';

interface TextProps {
	children: React.ReactNode;
	type?: TextType;
	weight?: string;
	color?: string;
	isItalic?: boolean;
}

const textBase : Record<TextType, string> = {
	'h1': 'text-2xl',
	'h2': 'text-xl',
	'h3': 'text-lg',
	'h4': 'text-md',
	'h5': 'text-sm',
	'h6': 'text-xs',
	'p': 'text-base',
	'span': 'text-base'
};

const textWeight : Record<TextWeight, string> = {
	'light': 'font-light',
	'normal': 'font-normal',
	'bold': 'font-bold'
}

const textColor : Record<ColorTheme, string> = {
	'background': 'text-background',
	'primary': 'text-primary',
	'secondary': 'text-secondary',
	'accent': 'text-accent',
	'success': 'text-success',
	'error': 'text-error',
	'warning': 'text-warning',
	'text': 'text-text',
	'white': 'text-white',
	'disabled' : 'text-disabled'
}

const CustomText = ({
	children,
	type : Tag = "p",
	color,
	weight,
	isItalic
}: TextProps) => {

	if (textBase[Tag] === undefined)
		return <p className="text-base">{children}</p>;
	
	const textStyling = `${textBase[Tag]} ${textWeight[weight]} ${textColor[color]} ${isItalic ? "italic" : null}`;

	return (
		<Tag className={textStyling}>
			{children}
		</Tag>
	)
}

export default CustomText;
