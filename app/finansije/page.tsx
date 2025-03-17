// components/AgGridWrapper.tsx
"use client";

import { useMemo } from 'react';
import dynamic from 'next/dynamic';
import { ClientSideRowModelModule } from "@ag-grid-community/client-side-row-model";
import { ModuleRegistry } from "@ag-grid-community/core";
import type { ColDef } from "@ag-grid-community/core";
import SafeAgGrid from '@/components/SafeAgGrid';

ModuleRegistry.registerModules([ClientSideRowModelModule]);
export default function VasPostpaidPage() {

const AgGridReact = dynamic(
  () => import('@ag-grid-community/react').then((mod) => mod.AgGridReact),
  { ssr: false }
);

interface Props<T> {
  rowData: T[];
  columnDefs: ColDef<T>[];
  paginationPageSize?: number;
  defaultColDef?: ColDef<T>;
}

export default function AgGridWrapper<T>({
  rowData,
  columnDefs,
  paginationPageSize = 20,
  defaultColDef
}: Props<T>) {
  const memoizedRowData = useMemo(() => rowData, [rowData]);
  const memoizedColumnDefs = useMemo(() => columnDefs, [columnDefs]);

    return (
      <div className="ag-theme-alpine" style={{ height: 600, width: "100%" }}>
        <AgGridReact
          rowData={memoizedRowData}
          columnDefs={memoizedColumnDefs}
          pagination={true}
          paginationPageSize={paginationPageSize}
          defaultColDef={defaultColDef}
          domLayout="autoHeight"
          <SafeAgGrid<VasPostpaidData>
        rowData={data}
        columnDefs={columnDefs}
        />
      </div>
    );
}