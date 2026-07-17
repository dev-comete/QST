import type { ReactNode } from "react"

export interface Column<T> {
  header: string;
  accessor: keyof T; 
  render?: (value: T[keyof T], record: T) => ReactNode; 
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  rowKey: keyof T;
}

export const Table = <T,>({ columns, data, rowKey }: TableProps<T>) => {
  return (
    <table className="min-w-full border-collapse">
      <thead>
        <tr>
          {columns.map((col, index) => (
            <th key={index} className="border-b p-2 text-left">
              {col.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row) => (
          <tr key={String(row[rowKey])} className="hover:bg-gray-50">
            {columns.map((col, colIndex) => {
              const rawValue = row[col.accessor];
              
              return (
                <td key={colIndex} className="border-b p-2">
                  {/* If a custom render function is provided, use it. Otherwise, print the raw value. */}
                  {col.render 
                    ? col.render(rawValue, row) 
                    : String(rawValue ?? "")
                  }
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