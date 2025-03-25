// components/BulkServisiTable.tsx
"use client";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useState } from "react";
import { toast } from "react-toastify";
import { BulkService } from "@/types"; // Make sure to define your BulkService type if it's not already

interface BulkServisiTableProps {
  data: BulkService[];
  onRowClick: (contractId: number) => void;
}

const BulkServisiTable: React.FC<BulkServisiTableProps> = ({ data, onRowClick }) => {
  // Definicija kolona za MUI DataGrid
  const columns: GridColDef[] = [
    { field: "provider_name", headerName: "Provider Name", flex: 1 },
    { field: "agreement_name", headerName: "Agreement Name", flex: 1 },
    { field: "service_name", headerName: "Service Name", flex: 1 },
    { field: "step_name", headerName: "Step Name", flex: 1 },
    { field: "sender_name", headerName: "Sender Name", flex: 1 },
    { field: "requests", headerName: "Requests", flex: 1 },
    { field: "message_parts", headerName: "Message Parts", flex: 1 },
  ];

  return (
    <div className="p-6" style={{ height: 600, width: "100%" }}>
      <DataGrid
        rows={data || []}
        columns={columns}
        pageSize={10}
        rowsPerPageOptions={[10, 25, 50]}
        disableSelectionOnClick
        onRowClick={(params) => onRowClick(params.row.id)}
        sx={{
          backgroundColor: "#f5f5f5",
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: "rgba(16, 185, 129, 0.8)",
            color: "#fff",
            fontWeight: "bold",
          },
          "& .MuiDataGrid-cell": {
            backgroundColor: "#fff",
          },
        }}
      />
    </div>
  );
};

export default BulkServisiTable;
