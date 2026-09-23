type StatMetric = {
	label: string,
	value: string,
	change: string,
}

type Session = {
	name: string,
	date: string
}

type RecentQuiz = {
	name: string,
	completion: string,
	status: string
}

type DashboardMetric = {
	stats: StatMetric[],
	recentQuizzes: RecentQuiz[],
	upcomingSessions: Session[]
}

export type {
	StatMetric,
	Session,
	RecentQuiz,
	DashboardMetric
}