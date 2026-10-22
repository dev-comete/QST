import { Navigate } from "react-router";
import { useAuth } from "../../../other/hooks/auth/useAuth";
import AdminTemplate from "../role/AdminTemplate";
import ApprenantTemplate from "../role/ApprenantTemplate";
import FormateurTemplate from "../role/FormateurTemplate";

const ProfileRouteLayout = () => {
	const { authUser } = useAuth();

	if (!authUser) {
		return <Navigate to="/login" replace />;
	}

	switch (authUser.role) {
		case "admin":
			return <AdminTemplate />;
		case "formateur":
			return <FormateurTemplate />;
		case "apprenant":
			return <ApprenantTemplate />;
		default:
			return <Navigate to="/unauthorized" replace />;
	}
};

export default ProfileRouteLayout;
