import Box from "../Container/Box";
import Paper from "../Container/Paper";
import CustomText from "../Text/CustomText";

const FetchError = () => {

	const msg = "Une erreur de téléchargement s'est produite. Veuillez réessayer plus tard"

	return (
		<Box className="w-full items-center justify-center p-5">
			<Paper className="p-10" hasShadow>
				<CustomText color="error" weight="bold">{msg}</CustomText>
			</Paper>
		</Box>
	)
}

export default FetchError;