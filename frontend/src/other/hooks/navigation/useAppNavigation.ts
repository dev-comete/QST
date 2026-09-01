// useAppNavigation.ts

import { useNavigate } from "react-router";
import { useAuth } from "../auth/useAuth";

	export const useAppNavigation = () => {
	const navigate = useNavigate();
	const { authUser } = useAuth();

	const navigateTo = (path: string) => {
		const cleanPath = path.startsWith('/') ? path.slice(1) : path;

		let rolePrefix = null

		if (authUser?.role != 'apprenant')
			rolePrefix = authUser?.role

		navigate(`/${rolePrefix}/${cleanPath}`);
	};

	return { navigateTo };
};