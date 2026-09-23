import VagueManagement from "../../product/pages/formateur/vague/VagueManagement";
import QuestionManagement from "../../product/pages/formateur/question/QuestionManagement";
import QuestionCreate from "../../product/pages/formateur/question/QuestionCreate";
import QuizManagement from "../../product/pages/formateur/quizz/QuizManagement";
import GlobalParam from "../../product/pages/formateur/globalParam/GlobalParam";
import QuestionDetailPage from "../../product/pages/formateur/question/QuestionDetailPage";
import QuizQuestion from "../../product/pages/formateur/quizz/QuizQuestion";
import VagueAssign from "../../product/pages/formateur/vague/VagueAssign";
import VagueStat from "../../product/pages/formateur/vague/VagueStat";
import QuestionEdit from "../../product/pages/formateur/question/QuestionEdit";
import QuestionBin from "../../product/pages/formateur/question/QuestionBin";
import QuizBin from "../../product/pages/formateur/quizz/QuizBin";

const COMMON_CHILDREN = [
	{ path: "gestion_vague", element: <VagueManagement /> },
	{ path: "gestion_question", element: <QuestionManagement /> },
	{ path: "gestion_question/corbeille", element: <QuestionBin /> },
	{ path: "gestion_question/:id/edit", element: <QuestionEdit /> },
	{ path: "creation_question", element: <QuestionCreate /> },
	{ path: ":id/question_detail", element: <QuestionDetailPage /> },
	{ path: ":id/quiz_questions", element: <QuizQuestion /> },
	{ path: "parametre_general", element: <GlobalParam /> },
	{ path: "gestion_quiz", element: <QuizManagement /> },
	{ path: "gestion_quiz/corbeille", element: <QuizBin /> },
	{ path: "vagues/:id", element: <VagueAssign /> },
	{ path: "vagues/:id/statistique", element: <VagueStat /> },
];

export default COMMON_CHILDREN;
