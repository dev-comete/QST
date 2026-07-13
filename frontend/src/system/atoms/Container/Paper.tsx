import type React from "react"
import { backgroundColor } from "../../../other/types/constant"

interface PaperProps {
	children : React.ReactNode,
	color?: string,
	hasShadow?: boolean

}

const Paper = ({
	children,
	color = "white",
	hasShadow = false
} : PaperProps) => {

	const boxShadow = hasShadow === true ? "shadow-md" : null ;

	return (
		<div
			className={`${backgroundColor[color]} ${boxShadow}`}
		>{children}</div>
	)
}

export default Paper;