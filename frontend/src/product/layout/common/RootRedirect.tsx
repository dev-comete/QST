import { Navigate } from "react-router";
import { useAuth } from "../../../other/hooks/auth/useAuth";

export const RootRedirect = () => {
	const { authUser } = useAuth();

	if (!authUser)
		return <Navigate to="/login" replace />;

	const role = (authUser.role || '').toString().toLowerCase();
	
	switch (role) {
		case 'admin':
			return <Navigate to="/admin" replace />;
		case 'formateur':
			return <Navigate to="/formateur" replace />;
		case 'apprenant':
			return <Navigate to="/my_eval" replace />;
		case 'rfq':
			return <Navigate to="/home" replace />; // or another default for RFQ
		default:
			return <Navigate to="/unauthorized" replace />;
	}
};