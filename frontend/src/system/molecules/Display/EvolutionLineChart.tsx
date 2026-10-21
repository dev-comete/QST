import {
	CartesianGrid,
	Legend,
	Line,
	LineChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts"
import type { EvolutionChartPoint, EvolutionChartSeries } from "../../../other/types/dashboardType"
import Paper from "../../atoms/Container/Paper"
import CustomText from "../../atoms/Text/CustomText"

interface EvolutionLineChartProps {
	data: EvolutionChartPoint[]
	series: EvolutionChartSeries[]
	hiddenSeries?: Record<string, boolean>
	onToggleSeries?: (key: string) => void
}

interface ChartTooltipProps {
	active?: boolean
	label?: string
	payload?: Array<{
		dataKey?: string | number
		name?: string
		value?: number | string | null
		color?: string
	}>
}

const ChartTooltip = ({ active, payload, label }: ChartTooltipProps) => {
	if (!active || !payload?.length) return null

	return (
		<Paper hasShadow className="p-3 min-w-[180px] border border-background">
			<CustomText weight="bold" textTag="h6" className="mb-2">
				{label}
			</CustomText>
			{payload.map((entry) => (
				<div
					key={String(entry.dataKey)}
					className="flex items-center justify-between gap-4"
				>
					<CustomText textTag="h6" className="flex items-center gap-2">
						<span
							className="w-2 h-2 rounded-full shrink-0"
							style={{ backgroundColor: entry.color }}
						/>
						{entry.name}
					</CustomText>
					<CustomText textTag="h6" weight="bold">
						{entry.value == null ? "—" : `${entry.value}%`}
					</CustomText>
				</div>
			))}
		</Paper>
	)
}

const EvolutionLineChart = ({
	data,
	series,
	hiddenSeries = {},
	onToggleSeries,
}: EvolutionLineChartProps) => {
	const angledLabels = data.length > 4

	return (
		<div className="w-full h-[320px]">
			<ResponsiveContainer width="100%" height="100%">
				<LineChart data={data} margin={{ top: 12, right: 16, left: 0, bottom: 8 }}>
					<CartesianGrid strokeDasharray="4 4" stroke="#e2e8f0" vertical={false} />
					<XAxis
						dataKey="quiz_titre"
						tick={{ fill: "#64748b", fontSize: 11 }}
						tickLine={false}
						axisLine={{ stroke: "#cbd5e1" }}
						interval={0}
						angle={angledLabels ? -25 : 0}
						textAnchor={angledLabels ? "end" : "middle"}
						height={angledLabels ? 72 : 40}
					/>
					<YAxis
						domain={[0, 100]}
						tick={{ fill: "#64748b", fontSize: 11 }}
						tickLine={false}
						axisLine={false}
						tickFormatter={(value: number) => `${value}%`}
						width={46}
					/>
					<Tooltip content={<ChartTooltip />} />
					<Legend
						wrapperStyle={{ paddingTop: 8, fontSize: 12, cursor: "pointer" }}
						iconType="circle"
						// onClick={(legendProps: { dataKey?: string | number }) => {
						// 	const seriesKey = legendProps?.dataKey
						// 	if (seriesKey !== undefined && onToggleSeries) {
						// 		onToggleSeries(String(seriesKey))
						// 	}
						// }}

						onClick={(payload) => {
						const seriesKey = payload?.dataKey;
						if ((typeof seriesKey === 'string' || typeof seriesKey === 'number') && onToggleSeries) {
							onToggleSeries(String(seriesKey));
						}
					}}
					/>
					{series.map((item) => {
						const isHidden = Boolean(hiddenSeries[item.key])

						return (
							<Line
								key={item.key}
								type="monotone"
								dataKey={item.key}
								hide={isHidden}
								name={item.label}
								stroke={item.color}
								strokeWidth={item.dashed ? 3 : 2}
								strokeDasharray={item.dashed ? "6 4" : undefined}
								strokeOpacity={isHidden ? 0.22 : 1}
								dot={{ r: 4, strokeWidth: 2, fill: "#ffffff" }}
								activeDot={{ r: 6 }}
								connectNulls={false}
							/>
						)
					})}
				</LineChart>
			</ResponsiveContainer>
		</div>
	)
}

export default EvolutionLineChart
