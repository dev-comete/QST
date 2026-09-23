import { createBrowserRouter, Navigate } from "react-router";
import FormateurTemplate from "../../product/layout/role/FormateurTemplate";
import Dashboard from "../../product/pages/formateur/Dashboard";
import AdminTemplate from "../../product/layout/role/AdminTemplate";
import ApprenantTemplate from "../../product/layout/role/ApprenantTemplate";
import UserManagement from "../../product/pages/admin/UserManagement";
import BulletinReview from "../../product/pages/apprenant/Bulletin/BulletinReview";
import Home from "../../product/pages/common/Home";
import Login from "../../product/pages/common/Login";
import AdminDashboard from "../../product/pages/admin/AdminDashboard";
import ProtectedRoute from "../../product/layout/common/ProtectedRoute";
import Unauthorized from "../../product/pages/common/Unauthorized";
import { RootRedirect } from "../../product/layout/common/RootRedirect";
import CorrectionReview from "../../product/pages/apprenant/Evaluation/CorrectionReview";
import COMMON_CHILDREN from "./sharedChildren";
import Bulletin from "../../product/pages/apprenant/Bulletin/Bulletin";
import MyEvaluations from "../../product/pages/apprenant/Evaluation/MyEvaluations";
import TakingEvaluation from "../../product/pages/apprenant/Evaluation/TakingEvaluation";

export const router = createBrowserRouter([

	// Public routes
	{ path: '/', element: <RootRedirect />},
	{ path: '/login', element: <Login /> },
	{ path: '/unauthorized', element: <Unauthorized /> },

	{
		element: <ProtectedRoute allowedRole={['admin', 'apprenant', 'formateur', 'rfq']}/>, 
		children: [
			{
				path: '/home',
				element: <Home />
			}
		]
	},

	//Admin routes
	{
		path: '/admin',
		element: <ProtectedRoute allowedRole={['admin']}/>,
		children: [
			{	
				element: <AdminTemplate />,
				children: [
					{ index: true, element: <Navigate to="gestion_utilisateurs" replace /> },
					{ path: 'gestion_utilisateurs', element: <UserManagement /> },
					{ path: 'tableau_de_bord', element: <AdminDashboard /> },
					...COMMON_CHILDREN,
				]
			},
		]
	},

	//Formateur routes
	{
		path: '/formateur',
		element: <ProtectedRoute allowedRole={['formateur']}/>,
		children: [
			{ 
				element: <FormateurTemplate />,
				children: [
					{ index: true, element: <Navigate to="gestion_vague" replace /> },
					...COMMON_CHILDREN,
					{ path: "tableau_de_bord", element: <Dashboard /> },
				],
			}
		]
	},

	// Apprenant routes
	{
		path: '/my_eval',
		element: <ProtectedRoute allowedRole={['apprenant']}/>,
		children: [
			{
				element: <ApprenantTemplate />,
				children: [ { index: true, element: <MyEvaluations /> } ],
			}
		]
	},
	{
		path: '/bulletin',
		element: <ProtectedRoute allowedRole={['apprenant']}/>,
		children: [
			{
				element: <ApprenantTemplate />,
				children: [ { index: true, element: <BulletinReview /> } ],
			}
		]
	},
	{
		path: '/quiz/:id/take',
		element: <ProtectedRoute allowedRole={['apprenant']}/>,
		children: [
			{
				element: <ApprenantTemplate />,
				children: [ { index: true, element: <TakingEvaluation /> } ],
			}
		]
	},
	{
		path: '/quiz/:id/revue',
		element: <ProtectedRoute allowedRole={['apprenant']}/>,
		children: [
			{
				element: <ApprenantTemplate />,
				children: [ { index: true, element: <CorrectionReview /> } ],
			}
		]
	},
	{
		path: '/vague/:id/bulletin',
		element: <ProtectedRoute allowedRole={['apprenant']}/>,
		children: [
			{
				element: <ApprenantTemplate />,
				children: [ { index: true, element: <Bulletin /> } ],
			}
		]
	},
]);

