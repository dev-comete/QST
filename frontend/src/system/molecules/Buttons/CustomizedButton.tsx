import { useAppNavigation } from "../../../other/hooks/navigation/useAppNavigation"
import FAIcon from "../../atoms/Icon/FAIcon"
import ActionButton from "./ActionButton"

export const CancelButton = ({ text = 'Non, annuler', onClick } : { text ?: string, onClick : () => void }) => {
	return (
		<ActionButton
			btnColor="white"
			textColor="text"
			onClick={onClick} 
			className="hover:bg-slate-100 px-4 py-2 rounded-lg transition-colors border border-background"
		>
			{text}
		</ActionButton>
	)
}

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