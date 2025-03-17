// components/SafeAgGrid.tsx
"use client";

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { ClientSideRowModelModule } from "@ag-grid-community/client-side-row-model";
import { ModuleRegistry } from "@ag-grid-community/core";

// Dynamic import са искљученим SSR
const AgGridReact = dynamic(
  () => import('@ag-grid-community/react').then((mod) => mod.AgGridReact),
  { ssr: false }
);

ModuleRegistry.registerModules([ClientSideRowModelModule]);

interface SafeAgGridProps<T> {
  rowData: T[];
  columnDefs: any[];
}

export default function SafeAgGrid<T>({ rowData, columnDefs }: SafeAgGridProps<T>) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // Динамички учитај CSS само на клијенту
    import('@ag-grid-community/styles/ag-grid.css');
    import('@ag-grid-community/styles/ag-theme-alpine.css');
  }, []);

  if (!isMounted) return null;

  return (
    <div className="ag-theme-alpine" style={{ height: 600, width: '100%' }}>
      <AgGridReact
        rowData={rowData}
        columnDefs={columnDefs}
        domLayout="autoHeight"
      />
    </div>
  );
}