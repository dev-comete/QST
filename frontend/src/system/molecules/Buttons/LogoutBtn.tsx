import { useLogout } from "../../../other/hooks/auth/useAuth";
import ActionButton from "./ActionButton";

const LogoutBtn = () => {

	const logout = useLogout();

	return (
		<ActionButton
			action={logout}
		>
			Déconnexion
		</ActionButton>
	)
}

export default LogoutBtn;