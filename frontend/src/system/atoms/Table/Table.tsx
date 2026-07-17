import type { ReactNode } from "react"

export interface Column<T> {
	header: string;
	key: keyof T; 
	render?: (value: T[keyof T], record: T) => ReactNode; 
}

interface TableProps<T> {
	columns: Column<T>[];
	data: T[];
	rowKey: keyof T;
}

export const Table = <T,>({ columns, data, rowKey }: TableProps<T>) => {
	return (
		<table className="w-full border-collapse">
			<thead>
				<tr>
					{columns.map((col, index) => (
						<th key={index} className="p-2 text-left text-white bg-secondary">
							{col.header}
						</th>
					))}
				</tr>
			</thead>
			<tbody>
				{
					data.map((row) => (
						<tr key={String(row[rowKey])} className="bg-white hover:bg-secondary/10">
						{
							columns.map((col, colIndex) => {
								const rawValue = row[col.key];

								return (
									<td key={colIndex} className="border-b border-secondary p-2">
										{ col.render ? col.render(rawValue, row) : String(rawValue ?? "") }
									</td>
								);
						})}
						</tr>
				))}
			</tbody>
		</table>
	);
};

export default Table;