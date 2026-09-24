import { useAppNavigation } from "../../../other/hooks/navigation/useAppNavigation"
import FAIcon from "../../atoms/Icon/FAIcon"
import ActionButton from "./ActionButton"

export const BackButton = ({ link } : { link? : string}) => {

	const { navigateTo } = useAppNavigation()

	return (
		<ActionButton
			onClick={() => navigateTo(link ?? -1)}
			btnColor="white"
			textColor="text"
		>
			<FAIcon name="chevron-left"/>Retour
		</ActionButton>
	)
}