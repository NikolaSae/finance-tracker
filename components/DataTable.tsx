'use client'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'

type VasPostpaidTable = {
  id: number
  Proizvod: string
  Mesec_pruzanja_usluge: string
  Jedinicna_cena: number
  Broj_transakcija: number
  Fakturisan_iznos: number
  Provajder?: string
}

type DataTableProps = {
  data: VasPostpaidTable[]
  meta: {
    total: number
    page: number
    pageSize: number
    totalPages: number
  }
  onPageChange?: (page: number) => void
}

const columnHelper = createColumnHelper<VasPostpaidTable>()

const columns = [
  columnHelper.accessor('Proizvod', {
    header: 'Proizvod',
    cell: info => info.getValue(),
  }),
  columnHelper.accessor('Mesec_pruzanja_usluge', {
    header: 'Mesec usluge',
    cell: info => info.getValue(),
  }),
  columnHelper.accessor('Jedinicna_cena', {
    header: 'Jed. cena',
    cell: info => `€${info.getValue().toLocaleString()}`,
  }),
  columnHelper.accessor('Broj_transakcija', {
    header: 'Transakcije',
    cell: info => info.getValue().toLocaleString(),
  }),
  columnHelper.accessor('Fakturisan_iznos', {
    header: 'Fakturisano',
    cell: info => `€${info.getValue().toLocaleString()}`,
  }),
  columnHelper.accessor('Provajder', {
    header: 'Provajder',
    cell: info => info.getValue() || 'N/A',
  }),
]

export function DataTable({ data, meta, onPageChange }: DataTableProps) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th
                    key={header.id}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
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
          <tbody className="bg-white divide-y divide-gray-200">
            {table.getRowModel().rows.map(row => (
              <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                {row.getVisibleCells().map(cell => (
                  <td
                    key={cell.id}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginacija */}
      <div className="mt-6 flex justify-between items-center">
        <div className="text-sm text-gray-700">
          Prikazano {data.length} od {meta.total} stavki
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onPageChange?.(meta.page - 1)}
            disabled={meta.page === 1}
            className="px-4 py-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Prethodna
          </button>
          <span className="px-4 py-2">
            Strana {meta.page} od {meta.totalPages}
          </span>
          <button
            onClick={() => onPageChange?.(meta.page + 1)}
            disabled={meta.page === meta.totalPages}
            className="px-4 py-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Sledeća
          </button>
        </div>
      </div>
    </div>
  )
}
