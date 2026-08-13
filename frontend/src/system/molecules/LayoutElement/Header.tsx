import { useLogout } from "../../../other/hooks/auth/useAuth";
import Box from "../../atoms/Container/Box";
import Paper from "../../atoms/Container/Paper";
import ActionButton from "../Buttons/ActionButton";
import Logo from "../Logo/Logo";

const Header = () => {

	const logout = useLogout();

	return (
		<Paper
			color="primary"
			hasShadow={true}
			className="w-full py-3 px-8 border border-b-background"
		>
			<Box className="justify-between items-center">
				<Logo />
				<ActionButton
					action={logout}
				>{"Déconnexion"}</ActionButton>
			</Box>
		</Paper>
	)
}

export default Header;