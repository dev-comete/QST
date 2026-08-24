import { createBrowserRouter, Navigate } from "react-router";
import FormateurTemplate from "../../product/layout/role/FormateurTemplate";
import QuestionManagement from "../../product/pages/formateur/question/QuestionManagement";
import QuizManagement from "../../product/pages/formateur/quizz/QuizManagement";
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
import Unauthorized from "../../product/pages/common/Unauthorized";
import { RootRedirect } from "../../product/layout/common/RootRedirect";
import { QuestionCreateProvider } from "../../product/context/QuestionCreateProvider";
import QuestionCreate from "../../product/pages/formateur/question/QuestionCreate";
import QuizAssign from "../../product/pages/formateur/quizz/QuizAssign";
import VagueAssign from "../../product/pages/formateur/vague/VagueAssign";
import VagueManagement from "../../product/pages/formateur/vague/VagueManagement";

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
			},
			{
				path: '/',
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
				]
			},
		]
	},

	//Formateur routes
	{
		path: '/formateur',
		element: <ProtectedRoute allowedRole={['admin', 'formateur']}/>,
		children: [
			{ 
				element: <FormateurTemplate />,
				children: [
					{ index: true, element: <Navigate to="gestion_vague" replace /> },
					{ path: "gestion_vague", element: <VagueManagement /> },
					{ path: ":id/assign_vague", element: <VagueAssign /> },
					{ path: "gestion_question", element: <QuestionManagement /> },
					{ path: "creation_question", element: <QuestionCreateProvider><QuestionCreate /></QuestionCreateProvider>},
					{ path: "gestion_quiz", element: <QuizManagement /> },
					{ path: ":id/assign_quiz", element: <QuizAssign /> },
					{ path: "tableau_de_bord", element: <Dashboard /> },
				],
			}
		]
	},

	//Apprenant routes
	{
		path: "/",
		element: <ProtectedRoute allowedRole={['admin', 'apprenant']}/>,
		children: [
			{ 
				element: <ApprenantTemplate />,
				children: [
					{ index: true, element: <Navigate to="calendrier_quiz" replace /> },
					{ path: "calendrier_quiz", element: <Calendar /> },
					{ path: "bulletin", element: <Bulletin /> },
					{ path: "evaluation", element: <Evaluation /> }
				],
			}
		]
	},
]);

