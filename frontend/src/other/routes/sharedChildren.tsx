import VagueManagement from "../../product/pages/formateur/vague/VagueManagement";
import VagueAssign from "../../product/pages/formateur/vague/VagueAssign";
import QuestionManagement from "../../product/pages/formateur/question/QuestionManagement";
import { QuestionCreateProvider } from "../../product/context/QuestionCreateProvider";
import QuestionCreate from "../../product/pages/formateur/question/QuestionCreate";
import QuizManagement from "../../product/pages/formateur/quizz/QuizManagement";
import QuizAssign from "../../product/pages/formateur/quizz/QuizAssign";

const COMMON_CHILDREN = [
	{ path: "gestion_vague", element: <VagueManagement /> },
	{ path: ":id/assign_vague", element: <VagueAssign /> },
	{ path: "gestion_question", element: <QuestionManagement /> },
	{ path: "creation_question", element: <QuestionCreateProvider><QuestionCreate /></QuestionCreateProvider> },
	{ path: "gestion_quiz", element: <QuizManagement /> },
	{ path: ":id/assign_quiz", element: <QuizAssign /> },
];

export default COMMON_CHILDREN;
