import Paper from "../../atoms/Container/Paper";
import CustomText from "../../atoms/Text/CustomText";

const ErrorBloc = ({ message } : { message: string }) => {
	return (
		<Paper color="error" className="p-3">
			<CustomText color="white">{message}</CustomText>
		</Paper>
	)
}

export default ErrorBloc;