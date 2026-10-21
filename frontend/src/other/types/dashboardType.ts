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

type EvolutionChartPoint = {
	quiz_id: number
	quiz_titre: string
	moyenne_classe: number
	[key: string]: number | string | null
}

type EvolutionChartResponse = {
	legendes: Record<string, string>
	chart_data: EvolutionChartPoint[]
}

type EvolutionChartSeries = {
	key: string
	label: string
	color: string
	dashed?: boolean
}

export type {
	StatMetric,
	Session,
	RecentQuiz,
	DashboardMetric,
	EvolutionChartPoint,
	EvolutionChartResponse,
	EvolutionChartSeries
}