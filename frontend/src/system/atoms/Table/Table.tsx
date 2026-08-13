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
	return (
			data.length == 0 ? <CustomText>Pas encore de données...</CustomText>
			: 
			<table className="w-3/4 border-collapse">
				<thead>
					<tr>
						{columns.map((col, index) => (
							<th key={index} className="p-2 text-center align-middle text-white bg-secondary">
								{col.header}
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					{
							
						data.map((row, idx) => (
							<tr key={String(row[rowKey]) + idx} className="bg-white hover:bg-secondary/10">
							{
								columns.map((col, colIndex) => {
	
									const rawValue = col.key in (row as object) 
									? row[col.key as keyof T] 
									: undefined;
	
									return (
										<td key={colIndex} className="border-b border-secondary p-2 text-center align-middle">
											<div className="flex w-full items-center justify-center">
																{ col.render ? col.render(rawValue, row, idx) : String(rawValue ?? "") }
											</div>
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