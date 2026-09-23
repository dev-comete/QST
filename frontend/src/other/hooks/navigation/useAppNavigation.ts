// useAppNavigation.ts

import { useNavigate } from "react-router";
import { useAuth } from "../auth/useAuth";

	export const useAppNavigation = () => {
	const navigate = useNavigate();
	const { authUser } = useAuth();

	const navigateTo = (path: string | -1) => {

		if (path === -1) {
			navigate(-1)
			return 
		}

		const cleanPath = path.startsWith('/') ? path.slice(1) : path;

		let rolePrefix

		if (authUser?.role != 'apprenant')
			rolePrefix = authUser?.role
		else
			rolePrefix = ''

		navigate(`/${rolePrefix}/${cleanPath}`);
	};

	return { navigateTo };
};