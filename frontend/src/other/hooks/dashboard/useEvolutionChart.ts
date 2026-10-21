import { useEffect, useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { VagueService } from "../../services/vagueService"
import { useVague } from "../vague/useVague"
import type { EvolutionChartSeries } from "../../types/dashboardType"

const CLASS_AVERAGE_KEY = "moyenne_classe"
const PRIMARY_LINE = "#0059e9"
const STUDENT_COLORS = ["#16a34a", "#f59e0b", "#f43f5e", "#7c3aed", "#0891b2", "#ea580c"]

export const studentSeriesKey = (studentId: number) => `etudiant_${studentId}`

const colorForStudent = (studentId: number) =>
	STUDENT_COLORS[Math.abs(studentId) % STUDENT_COLORS.length]

export const useEvolutionChart = () => {
	const { getAllVague } = useVague({})
	const vagues = getAllVague.data ?? []
	const [vagueId, setVagueId] = useState<number | null>(null)
	const [studentIds, setStudentIds] = useState<number[]>([])

	useEffect(() => {
		if (vagueId === null && vagues.length > 0) {
			setVagueId(vagues[0].id)
		}
	}, [vagueId, vagues])

	const selectedVague = vagues.find((vague) => vague.id === vagueId) ?? null

	const sortedStudentIds = useMemo(
		() => [...studentIds].sort((a, b) => a - b),
		[studentIds]
	)

	const chartQuery = useQuery({
		queryKey: ["evolution_chart", vagueId, sortedStudentIds],
		queryFn: () => VagueService.evolutionChart(vagueId as number, sortedStudentIds),
		enabled: vagueId !== null,
	})

	const selectVague = (id: number) => {
		setVagueId(id)
		setStudentIds([])
	}

	const toggleStudent = (id: number) => {
		setStudentIds((prev) =>
			prev.includes(id) ? prev.filter((studentId) => studentId !== id) : [...prev, id]
		)
	}

	const clearStudents = () => setStudentIds([])

	const series: EvolutionChartSeries[] = useMemo(() => {
		const classSeries: EvolutionChartSeries = {
			key: CLASS_AVERAGE_KEY,
			label: chartQuery.data?.legendes[CLASS_AVERAGE_KEY] ?? "Moyenne de la Vague",
			color: PRIMARY_LINE,
			dashed: true,
		}

		const studentSeries = studentIds.map((id) => ({
			key: studentSeriesKey(id),
			label:
				chartQuery.data?.legendes[studentSeriesKey(id)] ??
				selectedVague?.etudiants.find((student) => student.etudiant_id === id)?.username ??
				`Apprenant ${id}`,
			color: colorForStudent(id),
		}))

		return [classSeries, ...studentSeries]
	}, [chartQuery.data?.legendes, selectedVague, studentIds])

	return {
		vagues,
		vaguesPending: getAllVague.isPending,
		selectedVague,
		vagueId,
		selectVague,
		studentIds,
		toggleStudent,
		clearStudents,
		studentColor: colorForStudent,
		series,
		chart: chartQuery.data,
		chartPending: chartQuery.isPending,
		chartError: chartQuery.isError,
	}
}
