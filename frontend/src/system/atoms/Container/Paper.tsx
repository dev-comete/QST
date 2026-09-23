import type React from "react"
import { backgroundColor } from "../../../other/types/constant"
import type { ColorTheme } from "../../../other/types/common";

interface PaperProps {
	children : React.ReactNode,
	color?: ColorTheme,
	hasShadow?: boolean,
	position?: 'absolute' | 'sticky' |'relative' | 'fixed',
	className?: string
}

const Paper = ({
	children,
	color = "white",
	hasShadow = false,
	position,
	className
} : PaperProps) => {

	const boxShadow = hasShadow === true ? "shadow-md" : null ;

	return (
		<div
			className={`${backgroundColor[color]} ${boxShadow} ${position} ${className} rounded-xl`}
		>{children}</div>
	)
}

export default Paper;