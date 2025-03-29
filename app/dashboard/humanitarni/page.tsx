// app/dashboard/humanitarni/humanitarni.tsx
"use client";
import { useState, useMemo, useCallback, memo } from "react";
import { Box, Typography, CircularProgress, Button } from "@mui/material";
import { toast } from "react-toastify";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import NavbarMulti from "@/components/NavbarMulti";
import Form from "@/components/Form";
import UpdateContractForm from "@/components/UpdateContractForm";
import ContractsTable from "@/components/ContractsTable";
import { useContracts } from "@/hooks/useContracts";
import { useContractHistory } from "@/hooks/useContractHistory";
import "react-toastify/dist/ReactToastify.css";

const contractViewsConfig = [
  { name: "active_contracts", title: "Aktivni ugovori" },
  { name: "expired_contracts", title: "Neaktivni ugovori" },
];

export default function HumanitarniPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeView, setActiveView] = useState(contractViewsConfig[0].name);
  const [openForm, setOpenForm] = useState(false);
  const [selectedContractId, setSelectedContractId] = useState<number | null>(null);

  const { contracts, error, loading, refreshContracts } = useContracts(
    session?.accessToken ?? '',
    status ?? 'unauthenticated',
    router
  );
  const { historyData, loadingContractId, loadHistory } = useContractHistory();

  const handleEdit = useCallback((contractId: number) => {
    setSelectedContractId(contractId);
  }, []);

  const handleFormSubmit = useCallback(async (newContract: any) => {
    try {
      // Poziv API-ja za kreiranje ugovora se može implementirati ovde ili unutar Form komponente
      await refreshContracts();
      toast.success("Ugovor uspešno sačuvan");
      setOpenForm(false);
    } catch (err) {
      toast.error("Došlo je do greške pri čuvanju ugovora");
    }
  }, [refreshContracts]);

  return (
    <Box sx={{ padding: 2 }}>
      <Typography
        variant="h4"
        gutterBottom
        sx={{ borderBottom: "1px solid black", paddingBottom: 2, marginBottom: 4 }}
      >
        Humanitarni ugovori
      </Typography>
      <NavbarMulti activeView={activeView} setActiveView={setActiveView} viewsConfig={contractViewsConfig} />
      <Button variant="contained" color="primary" onClick={() => setOpenForm(true)} sx={{ mb: 4 }}>
        Dodaj novi ugovor
      </Button>
      <MemoizedContractsTable 
        contracts={contracts}
        historyData={historyData}
        loadHistory={loadHistory}
        loadingHistoryId={loadingContractId}
        onEdit={handleEdit}
        loading={loading}
        error={error}
      />
      <Form open={openForm} handleClose={() => setOpenForm(false)} handleSubmit={handleFormSubmit} />
      <UpdateContractForm
        open={!!selectedContractId}
        contractId={selectedContractId!}
        onClose={() => setSelectedContractId(null)}
        onUpdate={refreshContracts}
      />
    </Box>
  );
}

interface ContractsTableWrapperProps {
  contracts: any[]; // Replace with proper type
  historyData: any; // Replace with proper type
  loadHistory: (contractId: number) => void;
  loadingHistoryId: number | null;
  onEdit: (contractId: number) => void;
  loading: boolean;
  error: string | null;
}

const MemoizedContractsTable = memo(function ContractsTableWrapper({
  contracts,
  historyData,
  loadHistory,
  loadingHistoryId,
  onEdit,
  loading,
  error
}: ContractsTableWrapperProps) {
  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Typography color="error" sx={{ mt: 4, textAlign: "center" }}>
        {error}
      </Typography>
    );
  }

  return (
    <ContractsTable
      contracts={contracts}
      historyData={historyData}
      loadHistory={loadHistory}
      loadingHistoryId={loadingHistoryId}
      onEdit={onEdit}
    />
  );
});
