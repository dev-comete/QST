import type { ReactNode } from "react"
import CustomText from "../Text/CustomText";

export interface Column<T> {
	header: string;
	key: keyof T | (string & {});
	render?: (value?: T[keyof T], record?: T, index?: number) => ReactNode;
}

interface TableProps<T> {
	columns: Column<T>[];
	data: T[];
	rowKey: keyof T;
}


export const Table = <T,>({ columns, data, rowKey }: TableProps<T>) => {
    if (data.length === 0) {
        return (
            <div className="flex w-full items-center justify-center p-8 text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                <CustomText textTag="caption" isItalic={true}>Pas encore de données...</CustomText>
            </div>
        );
    }

    return (
        <div className="w-full overflow-hidden rounded-xl border border-slate-200/80 shadow-sm bg-white">
            <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-sm text-slate-700">
                    <thead>
                        <tr className="border-b border-slate-200 bg-secondary text-xs font-semibold uppercase tracking-wider text-slate-500">
                            {columns.map((col, index) => (
                                <th key={index} className="px-6 py-3.5 text-center align-middle">
                                    {col.header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 overflow-y-auto">
                        {data.map((row, idx) => (
                            <tr 
                                key={`${String(row[rowKey])}-${idx}`} 
                                className="transition-colors duration-150 ease-in-out hover:bg-slate-50/80"
                            >
                                {columns.map((col, colIndex) => {
                                    const rawValue = col.key in (row as object) 
                                        ? row[col.key as keyof T] 
                                        : undefined;

                                    return (
                                        <td key={colIndex} className="px-6 py-4 text-center align-middle font-normal">
                                            <div className="flex w-full items-center justify-center">
                                                {col.render 
                                                    ? col.render(rawValue, row, idx) 
                                                    : String(rawValue ?? "—")}
                                            </div>
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Table;