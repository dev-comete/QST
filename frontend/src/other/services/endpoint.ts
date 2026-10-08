export const ENDPOINTS = {
	AUTH: {
		LOGIN: 'accounts/auth/login/',
		SETPASS: '/accounts/auth/reset-password-confirm/',
	},
	QUESTION: {
		CREATE: 'quizzes/questions/create-full/',
		CRUD: '/quizzes/crud/questions/',
		TYPES: '/quizzes/crud/types-questions/',
		BAREME: '/quizzes/crud/baremes/',
		BANK: '/quizzes/banque-questions/',
		TRASH: '/quizzes/corbeille/questions/',
	},
	QUIZ: {
		CRUD: '/quizzes/crud/quizzes/',
		ASSIGN_QUESTION: '/quizzes/assign-questions/',
		EVAL: '/quizzes/mes-quiz/',
		SUBMIT: '/quizzes/student-submit/',
		TRASH: '/quizzes/corbeille/quizzes/',
	},
	FORMATION: 'quizzes/crud/formations/',
	VAGUE: {
		CREATE: '/formation/vagues/create/',
		LIST: 'formation/vagues/',
		ASSIGN_STUDENT: '/formation/vagues/assign-student/',
		ASSIGN_QUIZ: '/formation/vagues/assign-quiz/',
		ANALYTICS: '/quizzes/analytics/vague/',
		CRUD: '/quizzes/crud/vagues/',
	},
	USER: {
		CRUD: 'quizzes/crud/utilisateurs/',
		TYPE: '/quizzes/crud/types-utilisateurs/',
	},
	PROJECT: '/quizzes/crud/organisations/',
	BULLETIN: {
		MY_VAGUES: '/formation/student/mes-vagues/',
		MY_BULLETIN: '/quizzes/bulletin/vague/',
	},
	DASHBOARD: {
		METRICS: '/quizzes/dashboard/metrics/',
	},
};