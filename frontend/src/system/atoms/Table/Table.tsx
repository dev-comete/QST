import type { ReactNode } from "react";
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
    title?: string;
    page?: number;
    setPage?: (page: number | ((prev: number) => number)) => void;
    count?: number;
    setCount?: (count: number) => void;
    totalCount?: number;
}

export const Table = <T,>({
    columns,
    data,
    rowKey,
    title,
    // page,
    // setPage,
    // count,
    // setCount,
    // totalCount,
}: TableProps<T>) => {
    // const totalPages = Math.ceil(totalCount / count) || 1;
    // const startItem = totalCount === 0 ? 0 : (page - 1) * count + 1;
    // const endItem = Math.min(page * count, totalCount);

    if (data.length === 0) {
        return (
            <div className="flex w-full items-center justify-center p-8 bg-white rounded-xl">
                <CustomText textTag="h6" isItalic={true}>
                    Pas encore de données...
                </CustomText>
            </div>
        );
    }

    return (
        <div className="w-full overflow-hidden rounded-xl border border-slate-200/80 shadow-sm bg-white">
            {title && (
                <CustomText textTag="h2" weight="bold" className="text-center p-5 bg-transparent">
                    {title}
                </CustomText>
            )}

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
                                className="transition-colors duration-150 ease-in-out hover:bg-accent"
                            >
                                {columns.map((col, colIndex) => {
                                    const rawValue =
                                        col.key in (row as object)
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

            {/* Pagination Footer */}
            {/* <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200 bg-slate-50/50 px-6 py-3 text-xs text-slate-500">
                <div className="flex items-center gap-2">
                    <span>Afficher</span>
                    <select
                        value={count}
                        onChange={(e) => {
                            setCount(Number(e.target.value));
                            setPage(1); // Reset to first page when changing items per page
                        }}
                        className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-700 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
                    >
                        {[10, 20, 50].map((pageSize) => (
                            <option key={pageSize} value={pageSize}>
                                {pageSize}
                            </option>
                        ))}
                    </select>
                    <span>éléments par page</span>
                </div>

                <div>
                    Affichage de <span className="font-semibold text-slate-700">{startItem}</span> à{" "}
                    <span className="font-semibold text-slate-700">{endItem}</span> sur{" "}
                    <span className="font-semibold text-slate-700">{totalCount}</span> résultats
                </div>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                        disabled={page <= 1}
                        className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-medium text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        Précédent
                    </button>
                    <span className="px-2 font-medium text-slate-600">
                        {page} / {totalPages}
                    </span>
                    <button
                        type="button"
                        onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                        disabled={page >= totalPages}
                        className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-medium text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        Suivant
                    </button>
                </div>
            {/* </div> */}
        </div>
    );
};

export default Table;