import { useNavigate } from "react-router";
import Box from "../../atoms/Container/Box";
import Paper from "../../atoms/Container/Paper";
import ActionButton from "../Buttons/ActionButton";
import Logo from "../Logo/Logo";

const Header = () => {

	const navigate = useNavigate();

	return (
		<Paper
			color="primary"
			hasShadow={true}
			customStyling="w-full py-3 px-8 border border-b-background"
		>
			<Box customStyling="justify-between items-center">
				<Logo />
				<ActionButton
					action={() => navigate("/")}
				>{"Déconnexion"}</ActionButton>
			</Box>
		</Paper>
	)
}

export default Header;