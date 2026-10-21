import type { SyntheticEvent } from "react";
import DatePicker from "react-datepicker";
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
	onChange: (date: Date | null, event?: SyntheticEvent<any> | undefined) => void
}

export const DatePicking = ({ label, id, date, onChange } : DurationPickingProps) => {
	return (
		<div className="flex flex-col gap-1 w-full">
			<label htmlFor="date_debut">{label}</label>
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
				required
				wrapperClassName="w-full"
				className="w-full bg-white rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
				popperPlacement="bottom-start"
			/>
		</div>
	)
}
