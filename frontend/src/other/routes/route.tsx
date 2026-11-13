/* eslint-disable react-refresh/only-export-components */
import { createBrowserRouter, Navigate } from "react-router";
import { lazy } from "react";
import Login from "../../product/pages/common/Login";
import ProtectedRoute from "../../product/layout/common/ProtectedRoute";
import { RootRedirect } from "../../product/layout/common/RootRedirect";
import COMMON_CHILDREN from "./sharedChildren";
import ErrorPage from "../../product/pages/common/ErrorPage";
import { SuspenseWrapper } from "./SuspensWrapper";

// 1. Composants chargés paresseusement (Lazy Loading)
const FormateurTemplate = lazy(() => import("../../product/layout/role/FormateurTemplate"));
const AdminTemplate = lazy(() => import("../../product/layout/role/AdminTemplate"));
const ApprenantTemplate = lazy(() => import("../../product/layout/role/ApprenantTemplate"));
const Parameters = lazy(() => import("../../product/pages/admin/Parameters"));
const BulletinReview = lazy(() => import("../../product/pages/apprenant/Bulletin/BulletinReview"));
const CorrectionReview = lazy(() => import("../../product/pages/apprenant/Evaluation/CorrectionReview"));
const Bulletin = lazy(() => import("../../product/pages/apprenant/Bulletin/Bulletin"));
const MyEvaluations = lazy(() => import("../../product/pages/apprenant/Evaluation/MyEvaluations"));
const TakingEvaluation = lazy(() => import("../../product/pages/apprenant/Evaluation/TakingEvaluation"));
const Formation = lazy(() => import("../../product/pages/formateur/Formation"));
const ChatPage = lazy(() => import("../../product/pages/formateur/chat/ChatPage"));
const SetPasswordPage = lazy(() => import("../../product/pages/common/SetPasswordPage"));
const AdminDashboard = lazy(() => import("../../product/pages/admin/AdminDashboard"));
const Dashboard = lazy(() => import("../../product/pages/formateur/Dashboard"));
const ProfileRouteLayout = lazy(() => import("../../product/layout/common/ProfileRouteLayout"));
const ProfileMePage = lazy(() => import("../../product/pages/common/ProfileMePage"));
const UserBin = lazy(() => import("../../product/pages/admin/UserBin"));

export const router = createBrowserRouter([
	// Public routes
	{ path: '/', element: <RootRedirect />},
	{ path: '/login', element: <Login /> }, // Chargé instantanément
	{ path: '/unauthorized', element: <ErrorPage msg="Vous ne pouvez pas accéder à la page" statusCode={403} /> },
	{ path: '/set-password/:uid/:token', element: <SuspenseWrapper><SetPasswordPage /></SuspenseWrapper> },

	// Common protected routes
	{
		path: '/profile',
		element: <ProtectedRoute allowedRole={['admin', 'formateur', 'apprenant']} />,
		children: [
			{
				path: 'me',
				element: <SuspenseWrapper><ProfileRouteLayout /></SuspenseWrapper>,
				children: [
					{ index: true, element: <SuspenseWrapper><ProfileMePage /></SuspenseWrapper> },
				],
			}
		]
	},

    // Admin routes
    {
        path: '/admin',
        element: <ProtectedRoute allowedRole={['admin']}/>,
        children: [
            {   
                element: <SuspenseWrapper><AdminTemplate /></SuspenseWrapper>,
                children: [
                    { index: true, element: <Navigate to="tableau_de_bord" replace /> },
                    { path: 'parametre_general', element: <SuspenseWrapper><Parameters /></SuspenseWrapper> },
                    { path: 'tableau_de_bord', element: <SuspenseWrapper><AdminDashboard /></SuspenseWrapper> },
                    { path: 'corbeille', element: <SuspenseWrapper><UserBin /></SuspenseWrapper> },
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
				element: <SuspenseWrapper><FormateurTemplate /></SuspenseWrapper>,
				children: [
					{ index: true, element: <Navigate to="tableau_de_bord" replace /> },
					{ path: "tableau_de_bord", element: <SuspenseWrapper><Dashboard /></SuspenseWrapper> },
					{ path: "formation", element: <SuspenseWrapper><Formation /></SuspenseWrapper> },
					{ path: "chat", element: <SuspenseWrapper><ChatPage /></SuspenseWrapper> },
					...COMMON_CHILDREN,
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
				element: <SuspenseWrapper><ApprenantTemplate /></SuspenseWrapper>,
				children: [ { index: true, element: <SuspenseWrapper><MyEvaluations /></SuspenseWrapper> } ],
			}
		]
	},
	{
		path: '/bulletin',
		element: <ProtectedRoute allowedRole={['apprenant']}/>,
		children: [
			{
				element: <SuspenseWrapper><ApprenantTemplate /></SuspenseWrapper>,
				children: [ { index: true, element: <SuspenseWrapper><BulletinReview /></SuspenseWrapper> } ],
			}
		]
	},
	{
		path: '/quiz/:id/take',
		element: <ProtectedRoute allowedRole={['apprenant']}/>,
		children: [
			{
				element: <SuspenseWrapper><ApprenantTemplate /></SuspenseWrapper>,
				children: [ { index: true, element: <SuspenseWrapper><TakingEvaluation /></SuspenseWrapper> } ],
			}
		]
	},
	{
		path: '/quiz/:id/revue',
		element: <ProtectedRoute allowedRole={['apprenant']}/>,
		children: [
			{
				element: <SuspenseWrapper><ApprenantTemplate /></SuspenseWrapper>,
				children: [ { index: true, element: <SuspenseWrapper><CorrectionReview /></SuspenseWrapper> } ],
			}
		]
	},
	{
		path: '/vague/:id/bulletin',
		element: <ProtectedRoute allowedRole={['apprenant']}/>,
		children: [
			{
				element: <SuspenseWrapper><ApprenantTemplate /></SuspenseWrapper>,
				children: [ { index: true, element: <SuspenseWrapper><Bulletin /></SuspenseWrapper> } ],
			}
		]
	},

    { path: '*', element: <ErrorPage msg="La page est introuvable" statusCode={404} /> },
]);