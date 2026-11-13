// frontend/src/system/atoms/Form/TimePicking.tsx
import type { SyntheticEvent } from "react";
import DatePicker, { registerLocale } from "react-datepicker";
import { fr } from "date-fns/locale/fr";
import "react-datepicker/dist/react-datepicker.css";

// [NOUVEAUX IMPORTS POUR L'UX]
import LabelInput from "./LabelInput";
import FAIcon from "../Icon/FAIcon";

const TIME_INTERVAL = 15
registerLocale("fr", fr);

/* ==========================================
   ANCIEN CODE : DurationPicking
   ==========================================
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
*/

// NOUVEAU CODE : DurationPickingProps (Correction de l'interface)
interface DurationPickingProps {
    id?: string;
    label?: string;
    duree?: Date | null;
    onChange: (date: Date | null, event?: SyntheticEvent<any> | undefined) => void;
}

// NOUVEAU CODE : DurationPicking (Design System QST + Icône)
export const DurationPicking = ({ id = "duree", label = "Durée", duree, onChange } : DurationPickingProps) => {
    return (
        <div className="flex flex-col gap-1 w-full text-left">
            <LabelInput label={label} htmlFor={id} required={true} />
            <div className="relative w-full flex items-center">
                {/* Icône de sablier intégrée */}
                <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center text-disabled-dark z-10 pointer-events-none">
                    <FAIcon name="hourglass-half" />
                </div>
                <DatePicker
                    id={id}
                    selected={duree}
                    onChange={onChange}
                    showTimeSelect
                    showTimeSelectOnly
                    timeIntervals={TIME_INTERVAL}
                    timeCaption="Durée"
                    dateFormat="HH:mm"
                    timeFormat="HH:mm"
                    placeholderText="HH:mm (ex: 00:30)"
                    autoComplete="off"
                    required
                    wrapperClassName="w-full"
                    // Classes alignées sur Input.tsx (pl-10 laisse l'espace pour l'icône)
                    className="w-full bg-white rounded-xl border border-background py-2 pl-10 pr-3 text-base text-text focus:outline focus:outline-primary transition-all cursor-pointer shadow-sm"
                    popperPlacement="bottom-start"
                    openToDate={new Date(new Date().setHours(0, TIME_INTERVAL, 0, 0))}
                />
            </div>
        </div>
    )
}


/* ==========================================
   ANCIEN CODE : DatePicking
   ==========================================
// Le nom de l'interface écrasait DurationPickingProps par erreur
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
                // ...
                className="w-full bg-white rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
        </div>
    )
}
*/

// NOUVEAU CODE : DatePickingProps (Correction du nom de l'interface)
interface DatePickingProps {
    label: string;
    id: string;
    date?: Date | null;
    required?: boolean;
    onChange: (date: Date | null, event?: SyntheticEvent<any> | undefined) => void;
}

// NOUVEAU CODE : DatePicking (Design System QST + Icône)
export const DatePicking = ({ label, id, date, onChange, required = true } : DatePickingProps) => {
    return (
        <div className="flex flex-col gap-1 w-full text-left">
            <LabelInput label={label} htmlFor={id} required={required} />
            <div className="relative w-full flex items-center">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center text-disabled-dark z-10 pointer-events-none">
                    <FAIcon name="calendar-days" />
                </div>
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
                    className="w-full bg-white rounded-xl border border-background py-2 pl-10 pr-3 text-base text-text focus:outline focus:outline-primary transition-all cursor-pointer shadow-sm"
                    popperPlacement="bottom-start"
                />
            </div>
        </div>
    )
}


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

/* ==========================================
   ANCIEN CODE : MonthPicking
   ==========================================
export const MonthPicking = ({ ... }) => {
    return (
        <div className="flex flex-col gap-1 w-full">
            {label && (
                <label htmlFor={id}>
                    {label} {required && "*"}
                </label>
            )}
            <DatePicker
                // ...
                className="w-full bg-white rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
        </div>
    )
}
*/

// NOUVEAU CODE : MonthPicking (Design System QST + Icône)
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
        <div className="flex flex-col gap-1 w-full text-left">
            {label && <LabelInput label={label} htmlFor={id} required={required} />}
            <div className="relative w-full flex items-center">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center text-disabled-dark z-10 pointer-events-none">
                    <FAIcon name="calendar-check" />
                </div>
                <DatePicker
                    id={id}
                    selected={periodToDate(value)}
                    onChange={(date: Date | null) => onChange(dateToPeriod(date))}
                    showMonthYearPicker
                    dateFormat="MMMM yyyy"
                    locale="fr"
                    placeholderText="Période (Mois Année)"
                    autoComplete="off"
                    required={required}
                    isClearable
                    minDate={minDate}
                    maxDate={maxDate}
                    wrapperClassName="w-full"
                    className="w-full bg-white rounded-xl border border-background py-2 pl-10 pr-3 text-base text-text focus:outline focus:outline-primary transition-all cursor-pointer shadow-sm"
                    popperPlacement="bottom-start"
                />
            </div>
        </div>
    )
}