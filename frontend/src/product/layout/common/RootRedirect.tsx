import { Navigate } from "react-router";
import { useAuth } from "../../../other/hooks/auth/useAuth";

export const RootRedirect = () => {
	const { authUser } = useAuth();

	if (!authUser)
		return <Navigate to="/login" replace />;

	console.log("Root redirection", authUser)

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