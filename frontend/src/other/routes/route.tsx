import { createBrowserRouter } from "react-router";
import FormateurTemplate from "../../product/layout/FormateurTemplate";
import QuestionManagement from "../../product/pages/formateur/BankQuestion";
import Planning from "../../product/pages/formateur/Planning";
import QuizManagement from "../../product/pages/formateur/QuizManagement";
import Dashboard from "../../product/pages/formateur/Dashboard";
import AdminTemplate from "../../product/layout/AdminTemplate";
import ApprenantTemplate from "../../product/layout/ApprenantTemplate";
import UserManagement from "../../product/pages/admin/UserManagement";
import Calendar from "../../product/pages/apprenant/Calendar";
import Bulletin from "../../product/pages/apprenant/Bulletin";
import Evaluation from "../../product/pages/apprenant/Evaluation";
import Home from "../../product/pages/common/Home";

export const router = createBrowserRouter([
	{
		path: "/",
		element: <Home />,
	},
	{
		path: "/admin",
		element: <AdminTemplate />,
		children: [
			{
				index: true,
				path: "gestion_compte",
				element: <UserManagement />
			},
			{
				path: "tableau_de_bord",
				element: <Dashboard />
			}
		]
	},
	{
		path: "/formateur",
		element: <FormateurTemplate />,
		children: [
			{
				index: true,
				path: "planning",
				element: <Planning />
			},
			{
				path: "gestion_question",
				element: <QuestionManagement />
			},
			{
				path: "gestion_quizz",
				element: <QuizManagement />
			},
			{
				path: "tableau_de_bord",
				element: <Dashboard />
			}
		]
	},
	{
		path: "/apprenant",
		element: <ApprenantTemplate />,
		children: [
			{
				index: true,
				path: "calendrier_quizz",
				element: <Calendar />
			},
			{
				path: "bulletin",
				element: <Bulletin />
			}
		]
	},
	{
		path: "apprenant/evaluation",
		element: <Evaluation />
	}
]);

