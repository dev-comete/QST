import { useAppNavigation } from "../../../other/hooks/navigation/useAppNavigation";
import Box from "../../../system/atoms/Container/Box";
import Paper from "../../../system/atoms/Container/Paper";
import CustomText from "../../../system/atoms/Text/CustomText";
import ActionButton from "../../../system/molecules/Buttons/ActionButton";
import Logo from "../../../system/molecules/Logo/Logo";

interface ErrorPageProps {
	msg?: string
	info?: string
	statusCode?: number
}

const ErrorPage = ({ msg = 'Une erreur inattendue est survenue', info, statusCode } : ErrorPageProps) => {

	const { navigateTo } = useAppNavigation()

	return (
		<div className="flex w-full items-center justify-center h-[100vh] bg-background">
			<Paper className="min-h-[50vh] min-w-1/2 p-5" hasShadow>
				<Box direction="column" className="space-y-3 items-center">
					<Logo />
					<CustomText>Erreur</CustomText>
					<Box direction="column" className="items-center space-y-2">
						<CustomText color="error" weight='bold' textTag="h1" className="text-[100px] font-mono">{statusCode}</CustomText>
						<CustomText textTag="h2">{msg}</CustomText>
						<CustomText>{info}</CustomText>
					</Box>
					<ActionButton onClick={() => navigateTo('/')}>Retour à l'accueil</ActionButton>
				</Box>
			</Paper>
		</div>
	)
}

export default ErrorPage;