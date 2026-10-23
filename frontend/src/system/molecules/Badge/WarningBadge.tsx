import type { importWarning } from "../../../other/types/questionType"
import Box from "../../atoms/Container/Box"
import FAIcon from "../../atoms/Icon/FAIcon"

const WARNING_LABELS: Record<importWarning, string> = {
	no_correct_answer: "Aucune bonne réponse détectée",
	too_few_options: "Une seule option",
	all_options_correct: "Toutes les options sont correctes",
	unknown_type: "Type de question introuvable",
}

interface WarningBadgeProps {
	warning: importWarning
}

const WarningBadge = ({ warning }: WarningBadgeProps) => {
	return (
		<Box className="rounded-xl bg-warning-light text-warning px-2 py-1 w-fit shadow-sm text-sm items-center gap-1">
			<FAIcon name="triangle-exclamation" size="xs" />
			{WARNING_LABELS[warning]}
		</Box>
	)
}

export default WarningBadge;
