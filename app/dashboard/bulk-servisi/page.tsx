'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  ColumnDef,
  SortingState,
  getSortedRowModel,
} from '@tanstack/react-table';

const fetchBulkServisi = async () => {
  const response = await fetch('/api/bulk-servisi');
  if (!response.ok) throw new Error('Greška pri učitavanju podataka');
  return response.json();
};

const columns: ColumnDef<any>[] = [
  { header: 'Provider', accessorKey: 'provider_name' },
  { header: 'Ugovor', accessorKey: 'agreement_name' },
  { header: 'Servis', accessorKey: 'service_name' },
  { header: 'Step', accessorKey: 'step_name' },
  { header: 'Pošiljalac', accessorKey: 'sender_name' },
  { header: 'Zahtevi', accessorKey: 'requests' },
  { header: 'Delovi poruka', accessorKey: 'message_parts' },
];

export default function BulkServisiPage() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const { data, isLoading, error } = useQuery({
    queryKey: ['bulk-servisi'],
    queryFn: fetchBulkServisi,
  });

  const table = useReactTable({
    data: data || [],
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  if (isLoading) return <div>Učitavanje...</div>;
  if (error) return <div>Greška: {(error as Error).message}</div>;

  return (
  
    <div className="p-4 max-w-7xl mx-auto bg-red-50/20 border-2 border-dashed border-red-300">
      <h1 style={{ color: "red", fontSize: "32px" }}>Bulk Servisi</h1>
      
       <div className="rounded-lg border-4 border-green-300 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-indigo-50">
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th
                      key={header.id}
                      className="px-6 py-4 text-left text-sm font-semibold text-indigo-800 uppercase tracking-wider border-b-2 border-indigo-200"
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            
            <tbody className="bg-white divide-y divide-indigo-50">
              {table.getRowModel().rows.map(row => (
                <tr 
                  key={row.id}
                  className="hover:bg-indigo-50 transition-colors duration-150"
                >
                  {row.getVisibleCells().map(cell => (
                    <td
                      key={cell.id}
                      className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap"
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {data?.length === 0 && (
          <div className="p-6 text-center text-gray-500">
            Nema dostupnih podataka
          </div>
        )}
      </div>
    </div>
  );
}