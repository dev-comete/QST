import { lazy } from "react";
import { SuspenseWrapper } from "./SuspensWrapper";

// 1. Composants chargés paresseusement (Lazy Loading)
const VagueManagement = lazy(() => import("../../product/pages/formateur/vague/VagueManagement"));
const QuestionManagement = lazy(() => import("../../product/pages/formateur/question/QuestionManagement"));
const QuestionCreate = lazy(() => import("../../product/pages/formateur/question/QuestionCreate"));
const QuizManagement = lazy(() => import("../../product/pages/formateur/quizz/QuizManagement"));
const QuestionDetail = lazy(() => import("../../product/pages/formateur/question/QuestionDetail"));
const QuizQuestion = lazy(() => import("../../product/pages/formateur/quizz/QuizQuestion"));
const VagueAssign = lazy(() => import("../../product/pages/formateur/vague/VagueAssign"));
const QuestionEdit = lazy(() => import("../../product/pages/formateur/question/QuestionEdit"));
const QuestionBin = lazy(() => import("../../product/pages/formateur/question/QuestionBin"));
const QuizBin = lazy(() => import("../../product/pages/formateur/quizz/QuizBin"));

const COMMON_CHILDREN = [
	{ path: "gestion_equipe", element: <SuspenseWrapper><VagueManagement /></SuspenseWrapper> },
	{ path: "gestion_question", element: <SuspenseWrapper><QuestionManagement /></SuspenseWrapper> },
	{ path: "gestion_question/corbeille", element: <SuspenseWrapper><QuestionBin /></SuspenseWrapper> },
	{ path: "gestion_question/:id/edit", element: <SuspenseWrapper><QuestionEdit /></SuspenseWrapper> },
	{ path: "gestion_question/:id", element: <SuspenseWrapper><QuestionDetail /></SuspenseWrapper> },
	{ path: "creation_question", element: <SuspenseWrapper><QuestionCreate /></SuspenseWrapper> },
	{ path: ":id/quiz_questions", element: <SuspenseWrapper><QuizQuestion /></SuspenseWrapper> },
	{ path: "gestion_quiz", element: <SuspenseWrapper><QuizManagement /></SuspenseWrapper> },
	{ path: "gestion_quiz/corbeille", element: <SuspenseWrapper><QuizBin /></SuspenseWrapper> },
	{ path: "equipes/:id", element: <SuspenseWrapper><VagueAssign /></SuspenseWrapper> },
	// { path: "vagues/:id/statistique", element: <SuspenseWrapper><VagueStat /></SuspenseWrapper> },
];

export default COMMON_CHILDREN;