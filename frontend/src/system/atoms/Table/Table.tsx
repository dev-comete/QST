import type { ReactNode, MouseEvent, Dispatch, SetStateAction } from "react";
import CustomText from "../Text/CustomText";
import IconButton from "../../molecules/Buttons/IconButton";
import Box from "../Container/Box";
import SearchBar from "../../molecules/Input/SearchBar";

export interface Column<T> {
    header: string | null;
    key: keyof T | (string & {});
    //render?: (value?: T[keyof T], record?: T, index?: number) => ReactNode;
    render?: (value: any, record: T, index: number) => ReactNode;
}

interface TableProps<T> {
    columns: Column<T>[];
    data: T[];
    rowKey: keyof T;
    title?: string;
    page?: number;
    setPage?: (page: number | ((prev: number) => number)) => void;
	hasNextPage?: boolean
    count?: number;
    setCount?: (count: number) => void;
    totalCount?: number;
    emptyTitle?: string
    onRowClick?: (row: T, index: number, event?: MouseEvent<HTMLTableRowElement>) => void
	search?: string
	setSearch?: Dispatch<SetStateAction<string>>
	searchPlaceholder?: string
	filters?: ReactNode
}

type TableHeaderProps = Pick<
	TableProps<unknown>,
	'title' | 'search' | 'setSearch' | 'searchPlaceholder' | 'filters'
>;

type TablePaginationProps = Pick<
	TableProps<unknown>,
	'page' | 'setPage' | 'hasNextPage' | 'count' | 'setCount' | 'totalCount'
	& {
		hasNextPage?: boolean
	}
>;

const TableHeader = ({ title, search, setSearch, searchPlaceholder, filters } : TableHeaderProps) => {

	return (
		<Box direction="column" className="p-5 w-full">
			{title && (
				<CustomText textTag="h2" weight="bold" className="text-center bg-transparent">
					{title}
				</CustomText>
			)}
			<Box className="w-full items-center justify-between">
				{setSearch ? (
					<Box className="w-1/3">
						<SearchBar
							placeholder={searchPlaceholder}
							search={search}
							setSearch={setSearch}   
						/>
					</Box>
				) : (
					<div /> 
				)}
				
				<Box className="items-center">
					{filters}
				</Box>
			</Box>
		</Box>
	)
}

const TablePagination = ({
	page = 1,
	setPage,
	hasNextPage,
	// totalCount,
	// setCount,
	// count
} : TablePaginationProps) => {

	return (
		<div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200 bg-slate-50/50 px-6 py-3 text-xs text-slate-500">
			{/* <div className="flex items-center gap-2">
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
			</div> */}

			{/* <div>
				Affichage de <span className="font-semibold text-slate-700">{startItem}</span> à{" "}
				<span className="font-semibold text-slate-700">{endItem}</span> sur{" "}
				<span className="font-semibold text-slate-700">{totalCount}</span> résultats
			</div> */}
			<Box className="items-center w-full justify-center">
				<IconButton
					iconName="caret-left"
					action={() => setPage && setPage((prev) => Math.max((prev as number) - 1, 1))}
					disabled={page <= 1 || !setPage}
				/>
				<CustomText textTag="h6" className="bg-background p-2 rounded-lg">{page}</CustomText>
				<IconButton
					iconName="caret-right"
					action={() => setPage && setPage((prev) => ((prev as number) + 1))}
					disabled={!hasNextPage || !setPage}
				/>
			</Box>
		</div>
	)
}

export const Table = <T,>({
    columns,
    data,
    rowKey,
    title,
	emptyTitle = 'Aucune donnée disponible...',
	onRowClick,
    page,
    setPage,
	hasNextPage,
	search = '',
	setSearch,
	searchPlaceholder,
	filters,
    // count,
    // setCount,
    // totalCount,
}: TableProps<T>) => {
    // const totalPages = Math.ceil(totalCount / count) || 1;
    // const startItem = totalCount === 0 ? 0 : (page - 1) * count + 1;
    // const endItem = Math.min(page * count, totalCount);

	const hasHeader = Boolean(title) || Boolean(setSearch) || Boolean(filters);

    return (
        <div className="w-full rounded-xl border border-slate-200/80 shadow-sm bg-white">
			{
				hasHeader && <TableHeader
					title={title}
					setSearch={setSearch}
					search={search}
					searchPlaceholder={searchPlaceholder}
					filters={filters}
				/>

			}
			{
				<>
					<div className="w-full max-h-[70vh] overflow-y-auto">
						<table className="w-full border-collapse text-left text-sm text-slate-700">
							<thead className="sticky top-0 z-10">
								<tr className="border-b border-slate-200 bg-secondary text-xs font-semibold uppercase tracking-wider text-slate-500">
									{columns.map((col, index) => (
										<th key={index} className="px-6 py-3.5 text-center align-middle bg-secondary sticky top-0">
											{col.header}
										</th>
									))}
								</tr>
							</thead>
							{ data.length == 0 ?
								<tbody>
									<tr>
										<td colSpan={columns.length} className="bg-white p-8 text-center rounded-b-xl">
											<CustomText textTag="h6" isItalic={true}>
												{emptyTitle}
											</CustomText>
										</td>
									</tr>
								</tbody>
								: 
							<tbody className="divide-y divide-slate-100">
								{data.map((row, idx) => (
									<tr
										key={`${String(row[rowKey])}-${idx}`}
										className={`transition-colors duration-150 ease-in-out hover:bg-accent ${onRowClick ? 'cursor-pointer' : ''}`}
										onClick={(e) => onRowClick?.(row, idx, e)}
									>
										{columns.map((col, colIndex) => {
											const rawValue =
												col.key in (row as object)
													? row[col.key as keyof T]
													: undefined;

											return (
												<td key={colIndex} className="px-6 py-4 text-center align-top font-normal text-text">
													<div className="flex w-full items-start justify-center max-h-20 overflow-y-auto">
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
							}
						</table>
					</div>
					{
						setPage &&
						<TablePagination
							page={page}
							setPage={setPage}
							hasNextPage={hasNextPage}
							// totalCount,
							// setCount,
							// count
						/>
					}
				</>
			}
		</div>
	)
};

export default Table;