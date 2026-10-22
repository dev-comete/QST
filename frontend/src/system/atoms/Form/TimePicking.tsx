import type { SyntheticEvent } from "react";
import DatePicker from "react-datepicker";

// MonthPicker.tsx
import { registerLocale } from "react-datepicker";
import { fr } from "date-fns/locale/fr";
import "react-datepicker/dist/react-datepicker.css";

const TIME_INTERVAL = 15

interface DurationPickingProps {
	duree?: Date | null
	onChange: (date: Date | null, event?: SyntheticEvent<any> | undefined) => void
}

export const DurationPicking = ({ duree, onChange } : DurationPickingProps) => {
	return (
		<div className="flex flex-col gap-1 w-full">
			<label htmlFor="duree">Durée*</label>
			<DatePicker
				id="duree"
				selected={duree}
				onChange={onChange}
				showTimeSelect
				showTimeSelectOnly
				timeIntervals={TIME_INTERVAL}
				timeCaption="Durée"
				dateFormat="HH:mm"
				timeFormat="HH:mm"
				placeholderText="HH:mm"
				autoComplete="off"
				required
				wrapperClassName="w-full"
				className="w-full bg-white rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
				popperPlacement="bottom-start"
				openToDate={new Date(new Date().setHours(0, TIME_INTERVAL, 0, 0))}
			/>
		</div>
	)
}

interface DurationPickingProps {
	label: string
	id: string
	date?: Date | null
	required?: boolean
	onChange: (date: Date | null, event?: SyntheticEvent<any> | undefined) => void
}

export const DatePicking = ({ label, id, date, onChange, required = true } : DurationPickingProps) => {
	return (
		<div className="flex flex-col gap-1 w-full">
			<label htmlFor="date_debut">{`${label} ${required ? "*" : ''}`}</label>
			<DatePicker
				id={id}
				selected={date}
				onChange={onChange}
				showTimeSelect
				timeIntervals={TIME_INTERVAL}
				timeCaption="Heure"
				dateFormat="dd/MM/yyyy HH:mm"
				timeFormat="HH:mm"
				placeholderText="jj/mm/aaaa HH:mm"
				autoComplete="off"
				required={required}
				wrapperClassName="w-full"
				className="w-full bg-white rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
				popperPlacement="bottom-start"
			/>
		</div>
	)
}

registerLocale("fr", fr);

export interface Period {
	month: string // "01" to "12", or "" when empty
	year: string  // "2026", or "" when empty
}

interface MonthPickingProps {
	id: string
	label?: string
	value: Period
	onChange: (period: Period) => void
	required?: boolean
	minDate?: Date
	maxDate?: Date
}

const EMPTY_PERIOD: Period = { month: "", year: "" }

const periodToDate = ({ month, year }: Period): Date | null =>
	month && year ? new Date(Number(year), Number(month) - 1, 1) : null

const dateToPeriod = (date: Date | null): Period =>
	date
		? {
				month: String(date.getMonth() + 1).padStart(2, "0"),
				year: String(date.getFullYear()),
			}
		: EMPTY_PERIOD

export const MonthPicking = ({
	id,
	label,
	value,
	onChange,
	required,
	minDate,
	maxDate,
}: MonthPickingProps) => {
	return (
		<div className="flex flex-col gap-1 w-full">
			{label && (
				<label htmlFor={id}>
					{label}
					{required && "*"}
				</label>
			)}
			<DatePicker
				id={id}
				selected={periodToDate(value)}
				onChange={(date: Date | null) => onChange(dateToPeriod(date))}
				showMonthYearPicker
				dateFormat="MMMM yyyy"
				locale="fr"
				placeholderText="Période"
				autoComplete="off"
				required={required}
				isClearable
				minDate={minDate}
				maxDate={maxDate}
				wrapperClassName="w-full"
				className="w-full bg-white rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
				popperPlacement="bottom-start"
			/>
		</div>
	)
}
