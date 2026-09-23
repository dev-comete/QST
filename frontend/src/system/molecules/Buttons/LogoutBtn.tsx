import { useLogout } from "../../../other/hooks/auth/useAuth";
import FAIcon from "../../atoms/Icon/FAIcon";
import ActionButton from "./ActionButton";

const LogoutBtn = () => {

	const logout = useLogout();

	return (
		<ActionButton
			onClick={logout}
		>
			<FAIcon name="power-off"/> Déconnexion
		</ActionButton>
	)
}

export default LogoutBtn;