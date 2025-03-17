"use client";
import { ModuleRegistry } from 'ag-grid-community';
import { ClientSideRowModelModule } from 'ag-grid-community';
import { useEffect, useState, useRef } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.min.css";
import "ag-grid-community/styles/ag-theme-quartz.min.css";

ModuleRegistry.registerModules([ClientSideRowModelModule]);

interface VasServis {
  id: number;
  grupa: string;
  naziv_servisa: string;
  cena: number | null;
  date: string | null;
  broj_transakcija: number | null;
  ukupno: number | null;
  Provajder: string | null;
}

export default function VasServisiPage() {
  const gridRef = useRef(null);
  const [rowData, setRowData] = useState<VasServis[]>([]);
  const [quickFilterText, setQuickFilterText] = useState("");

  useEffect(() => {
    fetch("/api/vas-servisi")
      .then((res) => res.json())
      .then((data) => setRowData(data))
      .catch((err) => console.error("Error fetching data:", err));
  }, []);

  const onQuickFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuickFilterText(e.target.value);
    gridRef.current.api.setQuickFilter(e.target.value);
  };
const columnDefs = [
  { field: "id", headerName: "ID", filter: "agNumberColumnFilter", sortable: true },
  { field: "grupa", headerName: "Grupa", filter: "agTextColumnFilter", sortable: true },
  { field: "naziv_servisa", headerName: "Naziv Servisa", filter: "agTextColumnFilter", sortable: true },
  { field: "cena", headerName: "Cena", filter: "agNumberColumnFilter", sortable: true },
  { field: "date", headerName: "Datum", filter: "agDateColumnFilter", sortable: true },
  { field: "broj_transakcija", headerName: "Broj Transakcija", filter: "agNumberColumnFilter", sortable: true },
  { field: "ukupno", headerName: "Ukupno", filter: "agNumberColumnFilter", sortable: true },
  { field: "Provajder", headerName: "Provajder", filter: "agTextColumnFilter", sortable: true },
];
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">VAS Servisi</h1>
      <input
        type="text"
        placeholder="Quick Filter..."
        value={quickFilterText}
        onChange={onQuickFilterChange}
        style={{ marginBottom: "10px", padding: "4px", width: "100%" }}
      />
      <div className="ag-theme-alpine" style={{ height: 500, width: "100%" }}>
        <AgGridReact
          ref={gridRef}
          rowData={rowData}
          columnDefs={columnDefs}
          pagination={true}
        />
      </div>
    </div>
  );
}
