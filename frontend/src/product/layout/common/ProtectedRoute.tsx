import { useAuth } from "../../../other/hooks/auth/useAuth";
import type { Role } from "../../../other/types/common";
import { Navigate, Outlet, useLocation } from "react-router";

interface ProtectedRouteProps {
	allowedRole: Role[]
}

const ProtectedRoute = ({ allowedRole } : ProtectedRouteProps ) => {
	const { authUser } = useAuth()
	const location = useLocation();

	if (!authUser) {
		return <Navigate to="/login" state={{ from: location }} replace />;
	}

	if (authUser && location.pathname == "/login")
	{ return <Navigate to="/" state={{ from: location }} replace />;}

	const userRole = (authUser.role || '').toString().toLowerCase();
	const allowed = allowedRole?.map(r => r.toString().toLowerCase()) || [];

	if (allowedRole && !allowed.includes(userRole)) {
		return <Navigate to="/unauthorized" replace />;
	}

	return <Outlet />
}

export default ProtectedRoute;