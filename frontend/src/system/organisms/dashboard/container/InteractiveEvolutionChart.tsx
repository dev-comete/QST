import { useMemo, useState, type ChangeEvent } from "react"
import { useEvolutionChart } from "../../../../other/hooks/dashboard/useEvolutionChart"
import { useAppNavigation } from "../../../../other/hooks/navigation/useAppNavigation"
import Box from "../../../atoms/Container/Box"
import Paper from "../../../atoms/Container/Paper"
import Select from "../../../atoms/Form/Select"
import FAIcon from "../../../atoms/Icon/FAIcon"
import Spinner from "../../../atoms/Loading/Spinner"
import CustomText from "../../../atoms/Text/CustomText"
import ToggleChip from "../../../molecules/Badge/ToggleChip"
import PercentBadge from "../../../molecules/Badge/PercentBadge"
import ActionButton from "../../../molecules/Buttons/ActionButton"
import IconButton from "../../../molecules/Buttons/IconButton"
import EvolutionLineChart from "../../../molecules/Display/EvolutionLineChart"
import SearchBar from "../../../molecules/Input/SearchBar"
import ErrorBloc from "../../../molecules/Container/ErrorBloc"

const InteractiveEvolutionChart = () => {
	const { navigateTo } = useAppNavigation()
	const [studentSearch, setStudentSearch] = useState("")
	const [hiddenSeries, setHiddenSeries] = useState<Record<string, boolean>>({})
	const {
		vagues,
		vaguesPending,
		selectedVague,
		vagueId,
		selectVague,
		studentIds,
		toggleStudent,
		clearStudents,
		studentColor,
		series,
		chart,
		chartPending,
		chartError,
	} = useEvolutionChart()

	const vagueOptions = useMemo(
		() =>
			vagues.map((vague) => ({
				id: String(vague.id),
				value: `${vague.nom_vague} · ${vague.formation_nom}`,
			})),
		[vagues]
	)

	const selectedLabel =
		vagueOptions.find((option) => option.id === String(vagueId))?.value ?? ""

	const students = selectedVague?.etudiants ?? []
	const filteredStudents = students.filter((student) =>
		student.username.toLowerCase().includes(studentSearch.trim().toLowerCase())
	)

	const lastPoint = chart?.chart_data.at(-1)
	const previousPoint = chart?.chart_data.at(-2)
	const lastAverage = lastPoint?.moyenne_classe
	const delta =
		typeof lastAverage === "number" && typeof previousPoint?.moyenne_classe === "number"
			? Math.round((lastAverage - previousPoint.moyenne_classe) * 10) / 10
			: null

	const handleVagueChange = (event: ChangeEvent<HTMLSelectElement>) => {
		const option = vagueOptions.find((item) => item.value === event.target.value)
		if (!option) return
		setStudentSearch("")
		setHiddenSeries({})
		selectVague(Number(option.id))
	}

	const toggleSeriesVisibility = (seriesKey: string) => {
		setHiddenSeries((previous) => {
			if (previous[seriesKey]) {
				const next = { ...previous }
				delete next[seriesKey]
				return next
			}

			return { ...previous, [seriesKey]: true }
		})
	}

	const showStudentSearch = students.length > 8

	return (
		<Paper className="w-full p-5 flex flex-col gap-4">
			<Box className="w-full items-start justify-between flex-wrap gap-4">
				<Box className="items-start gap-3 min-w-0">
					<span className="text-primary border border-background p-2.5 rounded-xl shrink-0">
						<FAIcon name="chart-line" />
					</span>
					<Box direction="column" className="gap-0.5 min-w-0">
						<CustomText textTag="h2" weight="bold" color="primary">
							Évolution des équipes
						</CustomText>
						<CustomText textTag="h6" className="text-disabled-dark">
							Moyenne de la vague et trajectoires individuelles au fil des quiz
						</CustomText>
					</Box>
				</Box>

				<Box className="items-center flex-wrap">
					{typeof lastAverage === "number" && (
						<Box className="items-center gap-2 px-3 py-2 rounded-xl bg-secondary-light border border-background">
							<CustomText textTag="h6">Dernière moyenne</CustomText>
							<PercentBadge value={lastAverage} />
							{delta !== null && (
								<CustomText
									textTag="h6"
									weight="bold"
									color={delta >= 0 ? "success" : "error"}
								>
									{delta >= 0 ? `+${delta}` : delta} pts
								</CustomText>
							)}
						</Box>
					)}
					{selectedVague && (
						<IconButton
							iconName="arrow-up-right-from-square"
							title="Ouvrir l'équipe"
							iconStyling="text-primary"
							action={() => navigateTo(`equipes/${selectedVague.id}`)}
						/>
					)}
				</Box>
			</Box>

			<Box className="w-full items-end flex-wrap">
				<div className="w-full max-w-sm">
					<Select
						id="evolution-vague"
						name="evolution-vague"
						label="Équipe"
						placeholder={vaguesPending ? "Chargement des équipes..." : "Choisir une équipe"}
						selectionValue={vagueOptions}
						value={selectedLabel}
						handleChange={handleVagueChange}
					/>
				</div>
				{chart?.chart_data.length ? (
					<CustomText textTag="h6" className="text-disabled-dark pb-2">
						{chart.chart_data.length} quiz · {students.length} apprenant
						{students.length > 1 ? "s" : ""}
					</CustomText>
				) : null}
			</Box>

			{students.length > 0 && (
				<Box direction="column" className="w-full gap-3">
					<Box className="w-full items-center justify-between flex-wrap">
						<CustomText textTag="h6" weight="bold">
							Comparer des apprenants
						</CustomText>
						{studentIds.length > 0 && (
							<ActionButton
								btnColor="white"
								textColor="primary"
								onClick={clearStudents}
								className="!px-2 !py-1"
							>
								Réinitialiser
							</ActionButton>
						)}
					</Box>
					{showStudentSearch && (
						<div className="w-full max-w-sm">
							<SearchBar
								placeholder="Filtrer un apprenant"
								search={studentSearch}
								setSearch={setStudentSearch}
							/>
						</div>
					)}
					<Box className="w-full flex-wrap max-h-28 overflow-y-auto">
						{filteredStudents.map((student) => (
							<ToggleChip
								key={student.etudiant_id}
								label={student.username}
								selected={studentIds.includes(student.etudiant_id)}
								accent={studentColor(student.etudiant_id)}
								onClick={() => toggleStudent(student.etudiant_id)}
							/>
						))}
						{filteredStudents.length === 0 && (
							<CustomText textTag="h6" className="text-disabled-dark">
								Aucun apprenant ne correspond à la recherche
							</CustomText>
						)}
					</Box>
				</Box>
			)}

			<div className="w-full min-h-[320px]">
				{vaguesPending && (
					<Box direction="column" className="w-full h-[320px] items-center justify-center">
						<Spinner color="primary" size="lg" />
					</Box>
				)}

				{!vaguesPending && vagues.length === 0 && (
					<Box direction="column" className="w-full h-[280px] items-center justify-center gap-3">
						<FAIcon name="users" className="text-disabled" size="lg" />
						<CustomText>Aucune équipe à afficher</CustomText>
						<CustomText textTag="h6" className="text-disabled-dark">
							Créez une équipe pour suivre l'évolution des scores
						</CustomText>
					</Box>
				)}

				{!vaguesPending && vagues.length > 0 && chartPending && (
					<Box direction="column" className="w-full h-[320px] items-center justify-center">
						<Spinner color="primary" size="lg" />
						<CustomText textTag="h6" className="text-disabled-dark">
							Chargement de la courbe
						</CustomText>
					</Box>
				)}

				{chartError && (
					<ErrorBloc message="Impossible de charger l'évolution de cette équipe." />
				)}

				{!chartPending && !chartError && chart && chart.chart_data.length === 0 && (
					<Box direction="column" className="w-full h-[280px] items-center justify-center gap-3">
						<FAIcon name="file-circle-question" className="text-disabled" size="lg" />
						<CustomText>Cette équipe n'a pas encore de quiz assigné</CustomText>
						<CustomText textTag="h6" className="text-disabled-dark">
							Assignez des quiz pour visualiser la progression
						</CustomText>
					</Box>
				)}

				{!chartPending && !chartError && chart && chart.chart_data.length > 0 && (
					<EvolutionLineChart
						data={chart.chart_data}
						series={series}
						hiddenSeries={hiddenSeries}
						onToggleSeries={toggleSeriesVisibility}
					/>
				)}
			</div>
		</Paper>
	)
}

export default InteractiveEvolutionChart
