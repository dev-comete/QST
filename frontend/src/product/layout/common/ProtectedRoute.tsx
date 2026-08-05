import type { Role } from "../../../other/types/common";
import { Outlet } from "react-router";

interface ProtectedRouteProps {
	allowedRole: Role[]
}

const ProtectedRoute = ({ allowedRole } : ProtectedRouteProps ) => {

	// const { user, isAuthenticated, isLoading } = useAuth();
	// const location = useLocation();
  
	// if (isLoading) return <div>Loading...</div>;
  
	// if (!isAuthenticated) {
	//   return <Navigate to="/login" state={{ from: location }} replace />;
	// }
  
	// const hasRole = allowedRoles?.includes(user?.role);
  
	// if (allowedRoles && !hasRole) {
	//   return <Navigate to="/unauthorized" replace />;
	// }

	return <Outlet />
}

export default ProtectedRoute;