import VagueManagement from "../../product/pages/formateur/vague/VagueManagement";
import QuestionManagement from "../../product/pages/formateur/question/QuestionManagement";
import { QuestionCreateProvider } from "../../product/context/QuestionCreateProvider";
import QuestionCreate from "../../product/pages/formateur/question/QuestionCreate";
import QuizManagement from "../../product/pages/formateur/quizz/QuizManagement";
import GlobalParam from "../../product/pages/formateur/globalParam/GlobalParam";
import QuestionDetailPage from "../../product/pages/formateur/question/QuestionDetailPage";
import QuizQuestion from "../../product/pages/formateur/quizz/QuizQuestion";
import VagueAssign from "../../product/pages/formateur/vague/VagueAssign";
import VagueStat from "../../product/pages/formateur/vague/VagueStat";

const COMMON_CHILDREN = [
	{ path: "gestion_vague", element: <VagueManagement /> },
	{ path: "gestion_question", element: <QuestionManagement /> },
	{ path: "creation_question", element: <QuestionCreateProvider><QuestionCreate /></QuestionCreateProvider> },
	{ path: ":id/question_detail", element: <QuestionDetailPage /> },
	{ path: ":id/quiz_questions", element: <QuizQuestion /> },
	{ path: "parametre_general", element: <GlobalParam /> },
	{ path: "gestion_quiz", element: <QuizManagement /> },
	{ path: "vagues/:id", element: <VagueAssign /> },
	{ path: "vagues/:id/statistique", element: <VagueStat /> },
];

export default COMMON_CHILDREN;
