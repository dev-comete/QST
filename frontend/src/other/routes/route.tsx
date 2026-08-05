import { createBrowserRouter, Navigate } from "react-router";
import FormateurTemplate from "../../product/layout/role/FormateurTemplate";
import QuestionManagement from "../../product/pages/formateur/QuestionManagement";
import Planning from "../../product/pages/formateur/Planning";
import QuizManagement from "../../product/pages/formateur/QuizManagement";
import Dashboard from "../../product/pages/formateur/Dashboard";
import AdminTemplate from "../../product/layout/role/AdminTemplate";
import ApprenantTemplate from "../../product/layout/role/ApprenantTemplate";
import UserManagement from "../../product/pages/admin/UserManagement";
import Calendar from "../../product/pages/apprenant/Calendar";
import Bulletin from "../../product/pages/apprenant/Bulletin";
import Evaluation from "../../product/pages/apprenant/Evaluation";
import Home from "../../product/pages/common/Home";
import Login from "../../product/pages/common/Login";
import AdminDashboard from "../../product/pages/admin/AdminDashboard";
import ProtectedRoute from "../../product/layout/common/ProtectedRoute";

/* FOR TESTING ONLY */
import Test from "../../product/pages/Test";

export const router = createBrowserRouter([

	// Public routes
	{ path: "/test", element: <Test /> },
	{ path: '/', element: <Home /> },
	{ path: '/login', element: <Login /> },
	// { path: '/unauthorized', element: <Unauthorized /> },

	//Admin routes
	{
		path: '/admin',
		element: <ProtectedRoute allowedRole={['admin']}/>,
		children: [
			{	
				element: <AdminTemplate />,
				children: [

					{ index: true, element: <Navigate to="gestion_compte" replace /> },

					{ path: 'gestion_compte', element: <UserManagement /> },
					{ path: 'tableau_de_bord', element: <AdminDashboard /> },
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

					{ index: true, element: <Navigate to="planning" replace /> },

					{ path: "planning", element: <Planning /> },
					{ path: "gestion_question", element: <QuestionManagement /> },
					{ path: "gestion_quizz", element: <QuizManagement /> },
					{ path: "tableau_de_bord", element: <Dashboard /> }
				],
			}
		]
	},

	//Apprenant routes
	{
		element: <ProtectedRoute allowedRole={['apprenant']}/>,
		children: [
			{ 
				element: <ApprenantTemplate />,
				children: [

					{ index: true, element: <Navigate to="planning" replace /> },

					{ path: "calendrier_quiz", element: <Calendar /> },
					{ path: "bulletin", element: <Bulletin /> },
					{ path: "evaluation", element: <Evaluation /> }
				],
			}
		]
	},
]);

