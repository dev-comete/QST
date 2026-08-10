import { Navigate } from "react-router";
import { useAuth } from "../../../other/hooks/useAuth";

export const RootRedirect = () => {
	const { authUser } = useAuth();

	if (!authUser)
		return <Navigate to="/login" replace />;

	switch (authUser.role) {
		case 'admin':
			return <Navigate to="/admin" replace />;
		case 'formateur':
			return <Navigate to="/formateur" replace />;
		case 'apprenant':
			return <Navigate to="/apprenant" replace />;
		case 'rfq':
			return <Navigate to="/home" replace />; // or another default for RFQ
		default:
			return <Navigate to="/unauthorized" replace />;
	}
};