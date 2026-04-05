import React from 'react';
import './DataTable.css';

export interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  isLoading?: boolean;
}

export function DataTable<T>({ data, columns, isLoading }: DataTableProps<T>) {
  if (isLoading) {
    return <div className="sc-table-loading">Loading...</div>;
  }

  if (!data || data.length === 0) {
    return <div className="sc-table-empty">No records found.</div>;
  }

  return (
    <div className="sc-table-container animate-fade-in">
      <table className="sc-table">
        <thead>
          <tr>
            {columns.map((col, idx) => (
              <th key={idx}>{col.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {columns.map((col, colIndex) => {
                const content =
                  typeof col.accessor === 'function'
                    ? col.accessor(row)
                    : (row[col.accessor] as unknown as React.ReactNode);
                return <td key={colIndex}>{content}</td>;
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
