import VagueManagement from "../../product/pages/formateur/vague/VagueManagement";
import VagueAssign from "../../product/pages/formateur/vague/VagueAssign";
import QuestionManagement from "../../product/pages/formateur/question/QuestionManagement";
import { QuestionCreateProvider } from "../../product/context/QuestionCreateProvider";
import QuestionCreate from "../../product/pages/formateur/question/QuestionCreate";
import QuizManagement from "../../product/pages/formateur/quizz/QuizManagement";
import QuizAssign from "../../product/pages/formateur/quizz/QuizAssign";
import GlobalParam from "../../product/pages/formateur/globalParam/GlobalParam";
import QuestionDetailPage from "../../product/pages/formateur/question/QuestionDetailPage";
import QuizQuestionDetail from "../../product/pages/formateur/quizz/QuizQuestionDetail";

const COMMON_CHILDREN = [
	{ path: "gestion_vague", element: <VagueManagement /> },
	{ path: ":id/assign_vague", element: <VagueAssign /> },
	{ path: "gestion_question", element: <QuestionManagement /> },
	{ path: "creation_question", element: <QuestionCreateProvider><QuestionCreate /></QuestionCreateProvider> },
	{ path: ":id/question_detail", element: <QuestionDetailPage /> },
	{ path: ":id/quiz_question_detail", element: <QuizQuestionDetail /> },
	{ path: "parametre_general", element: <GlobalParam /> },
	{ path: "gestion_quiz", element: <QuizManagement /> },
	{ path: ":id/assign_quiz", element: <QuizAssign /> },
];

export default COMMON_CHILDREN;
