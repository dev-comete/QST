import type React from "react"
import { backgroundColor } from "../../../other/types/constant"

interface PaperProps {
	children : React.ReactNode,
	color?: string,
	hasShadow?: boolean,
	position?: 'absolute' | 'sticky' |'relative' | 'fixed',
	customStyling?: string
}

const Paper = ({
	children,
	color = "white",
	hasShadow = false,
	position,
	customStyling
} : PaperProps) => {

	const boxShadow = hasShadow === true ? "shadow-md" : null ;

	return (
		<div
			className={`${backgroundColor[color]} ${boxShadow} ${position} ${customStyling}`}
		>{children}</div>
	)
}

export default Paper;