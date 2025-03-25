// app/dashboard/bulk-servisi/page.tsx
"use client";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Form from "@/components/Form";
import UpdateContractForm from "../../../components/UpdateContractForm";
import BulkServisiTable from "../../../components/BulkServisiTable"; // Importing the new table component
import SessionInfo from "../../../components/SessionInfo"; // Importing SessionInfo

const contractViewsConfig = [
  { name: "active_contracts", title: "Aktivni ugovori" },
  { name: "expired_contracts", title: "Neaktivni ugovori" },
];

const fetchBulkServisi = async () => {
  const response = await fetch("/api/bulk-servisi");
  if (!response.ok) throw new Error("Greška pri učitavanju podataka");
  return response.json();
};

export default function BulkServisiPage({ session }) {
  const [openForm, setOpenForm] = useState(false);
  const [openUpdateForm, setOpenUpdateForm] = useState(false);
  const [selectedContractId, setSelectedContractId] = useState<number | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["bulk-servisi"],
    queryFn: fetchBulkServisi,
  });

  useEffect(() => {
    if (isLoading) {
      document.body.classList.add("wait-cursor");
    } else {
      document.body.classList.remove("wait-cursor");
    }
    return () => {
      document.body.classList.remove("wait-cursor");
    };
  }, [isLoading]);

  const handleFormSubmit = async (newContract: BulkService) => {
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

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Pass session to SessionInfo */}
      <SessionInfo session={session} />

      <div className="bg-white rounded-xl shadow-lg border-2 border-emerald-200 overflow-hidden">
        {/* Header */}
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

        {/* BulkServisiTable Component */}
        <BulkServisiTable
          data={data || []}
          onRowClick={handleEditContract}
        />
      </div>

      <ToastContainer />

      {/* Move these components INSIDE the main container */}
      <Form open={openForm} handleClose={() => setOpenForm(false)} handleSubmit={handleFormSubmit} />
      {openUpdateForm && (
        <UpdateContractForm
          open={openUpdateForm}
          contractId={selectedContractId!}
          onClose={() => setOpenUpdateForm(false)}
          onUpdate={() => {}}
        />
      )}
    </div>
  );
}
