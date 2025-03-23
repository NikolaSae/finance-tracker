'use client';
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Layout from '@/components/Layout';
import Form from '@/components/Form';
import UpdateContractForm from '@/components/UpdateContractForm';

const contractViewsConfig = [
  { name: "active_contracts", title: "Aktivni ugovori" },
  { name: "expired_contracts", title: "Neaktivni ugovori" },
];

const fetchBulkServisi = async () => {
  const response = await fetch('/api/bulk-servisi');
  if (!response.ok) throw new Error('Greška pri učitavanju podataka');
  return response.json();
};

export default function BulkServisiPage() {
  const [activeView, setActiveView] = useState(contractViewsConfig[0].name);
  const [openForm, setOpenForm] = useState(false);
  const [openUpdateForm, setOpenUpdateForm] = useState(false);
  const [selectedContractId, setSelectedContractId] = useState<number | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['bulk-servisi'],
    queryFn: fetchBulkServisi,
  });

  useEffect(() => {
    if (isLoading) {
      document.body.classList.add('wait-cursor');
    } else {
      document.body.classList.remove('wait-cursor');
    }
    return () => {
      document.body.classList.remove('wait-cursor');
    };
  }, [isLoading]);

  const handleFormSubmit = async (newContract: any) => {
    try {
      const response = await fetch("/api/contract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newContract),
      });
      const text = await response.text();
      const result = JSON.parse(text);
      if (response.ok) {
        toast.success(result.message);
        // Po potrebi refetch podataka
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Došlo je do greške pri komunikaciji sa serverom");
    }
  };

  const handleEditContract = (contractId: number) => {
    setSelectedContractId(contractId);
    setOpenUpdateForm(true);
  };

  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-emerald-600"></div>
      </div>
    );
  }

  if (error) return <div className="text-red-600 p-6">Greška: {(error as Error).message}</div>;

  // Definicija kolona za MUI DataGrid
  const columns: GridColDef[] = [
    { field: 'provider_name', headerName: 'provider name', flex: 1 },
    { field: 'agreement_name', headerName: 'agreement name', flex: 1 },
    { field: 'service_name', headerName: 'service name', flex: 1 },
    { field: 'step_name', headerName: 'step name', flex: 1 },
    { field: 'sender_name', headerName: 'sender name', flex: 1 },
    { field: 'requests', headerName: 'requests', flex: 1 },
    { field: 'message_parts', headerName: 'message parts', flex: 1 },
  ];

  return (
    <Layout className="relative">
      <div className="p-6 max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg border-2 border-emerald-200 overflow-hidden">
          {/* Zaglavlje */}
          <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 px-8 py-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-white">Bulk Servisi</h1>
              <button
                onClick={() => {}}
                className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
              >
                Grupiši po Provideru (Premium feature)
              </button>
            </div>
          </div>
          {/* Tabela pomoću MUI DataGrid */}
          <div className="p-6" style={{ height: 600, width: '100%' }}>
            <DataGrid
              rows={data || []}
              columns={columns}
              pageSize={10}
              rowsPerPageOptions={[10, 25, 50]}
              disableSelectionOnClick
              onRowClick={(params) => handleEditContract(params.row.id)}
              sx={{
                backgroundColor: '#f5f5f5', // pozadina tabele
                '& .MuiDataGrid-columnHeaders': {
                  backgroundColor: 'rgba(16, 185, 129, 0.8)', // zelena zaglavlja
                  color: '#fff',
                  fontWeight: 'bold',
                },
                '& .MuiDataGrid-cell': {
                  backgroundColor: '#fff', // bela pozadina ćelija
                },
              }}
            />
          </div>
        </div>
        <ToastContainer />
      </div>
      <Form open={openForm} handleClose={() => setOpenForm(false)} handleSubmit={handleFormSubmit} />
      {openUpdateForm && (
        <UpdateContractForm 
          open={openUpdateForm}
          contractId={selectedContractId!}
          onClose={() => setOpenUpdateForm(false)}
          onUpdate={() => {}}
        />
      )}
    </Layout>
  );
}
