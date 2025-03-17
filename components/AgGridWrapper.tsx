"use client";
import { useMemo, useRef } from 'react';
import dynamic from 'next/dynamic';
import { ClientSideRowModelModule } from "@ag-grid-community/client-side-row-model";
import { ModuleRegistry } from "@ag-grid-community/core";
import type { ColDef } from "@ag-grid-community/core";
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';

// Register AG Grid modules
ModuleRegistry.registerModules([ClientSideRowModelModule]);

// Dynamically import AgGridReact to avoid SSR issues
const AgGridReact = dynamic(
  () => import('@ag-grid-community/react').then((mod) => mod.AgGridReact),
  { 
    ssr: false, // Disable server-side rendering
    loading: () => <div className="text-blue-500">Učitavam tabelu...</div> // Loading component
  }
);

// Define the props interface
interface Props<T> {
  rowData: T[];
  columnDefs: ColDef<T>[];
}

// AgGridWrapper Component
export default function AgGridWrapper<T>({ rowData, columnDefs }: Props<T>) {
  const gridRef = useRef<AgGridReact>(null);
  const memoizedData = useMemo(() => rowData, [rowData]);
  const memoizedColumns = useMemo(() => columnDefs, [columnDefs]);

  return (
    <div className="ag-theme-quartz" style={{ height: 600, width: '100%' }}>
      <AgGridReact
        ref={gridRef}
        rowData={memoizedData}
        columnDefs={memoizedColumns}
        pagination={true}
        paginationPageSize={20}
        domLayout="autoHeight"
        defaultColDef={{
          sortable: true,
          filter: true,
          resizable: true,
          floatingFilter: true,
          flex: 1,
          minWidth: 100,
        }}
        multiSortKey="ctrl"
        rowGroupPanelShow="always" // Show the row group panel
      />
    </div>
  );
}