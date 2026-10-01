import VagueManagement from "../../product/pages/formateur/vague/VagueManagement";
import QuestionManagement from "../../product/pages/formateur/question/QuestionManagement";
import QuestionCreate from "../../product/pages/formateur/question/QuestionCreate";
import QuizManagement from "../../product/pages/formateur/quizz/QuizManagement";
import QuestionDetail from "../../product/pages/formateur/question/QuestionDetail";
import QuizQuestion from "../../product/pages/formateur/quizz/QuizQuestion";
import VagueAssign from "../../product/pages/formateur/vague/VagueAssign";
import VagueStat from "../../product/pages/formateur/vague/VagueStat";
import QuestionEdit from "../../product/pages/formateur/question/QuestionEdit";
import QuestionBin from "../../product/pages/formateur/question/QuestionBin";
import QuizBin from "../../product/pages/formateur/quizz/QuizBin";
import { AnalyticsEvolution } from "../../product/pages/admin/AnalyticsEvolution";

const COMMON_CHILDREN = [
	{ path: "gestion_vague", element: <VagueManagement /> },
	{ path: "gestion_question", element: <QuestionManagement /> },
	{ path: "gestion_question/corbeille", element: <QuestionBin /> },
	{ path: "gestion_question/:id/edit", element: <QuestionEdit /> },
	{ path: "gestion_question/:id", element: <QuestionDetail /> },
	{ path: "creation_question", element: <QuestionCreate /> },
	{ path: ":id/quiz_questions", element: <QuizQuestion /> },
	{ path: "gestion_quiz", element: <QuizManagement /> },
	{ path: "gestion_quiz/corbeille", element: <QuizBin /> },
	{ path: "vagues/:id", element: <VagueAssign /> },
	{ path: "vagues/:id/statistique", element: <VagueStat /> },
	{ path: "vagues/:id/evolution", element: <AnalyticsEvolution /> },
];

export default COMMON_CHILDREN;
