"use client";
import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  CircularProgress,
  Button,
  Collapse,
  IconButton,
} from "@mui/material";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import NavbarMulti from "@/components/NavbarMulti";
import Layout from "@/components/Layout";
import Form from "@/components/Form";
import UpdateContractForm from "@/components/UpdateContractForm";
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import PersonIcon from '@mui/icons-material/Person';
import EditNoteIcon from '@mui/icons-material/EditNote';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
  
const contractViewsConfig = [
  { name: "active_contracts", title: "Aktivni ugovori" },
  { name: "expired_contracts", title: "Neaktivni ugovori" },
];

export default function ContractsTable() {
  const [activeView, setActiveView] = useState(contractViewsConfig[0].name);
  const [contractsData, setContractsData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [openForm, setOpenForm] = useState<boolean>(false);
  const [openUpdateForm, setOpenUpdateForm] = useState<boolean>(false);
  const [selectedContractId, setSelectedContractId] = useState<number | null>(null);
  const [expandedContractId, setExpandedContractId] = useState<number | null>(null);
  const [historyData, setHistoryData] = useState<{ [key: number]: any[] }>({});
  const [historyLoading, setHistoryLoading] = useState<number | null>(null);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);



  // Dodata funkcija za osvežavanje podataka
  const refreshData = async () => {
    try {
      const response = await fetch("/api/contract");
      if (!response.ok) throw new Error("Failed to fetch data");
      const data = await response.json();
      setContractsData(data);
    } catch (err) {
      setError("Error loading contract data");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        await refreshData();
      } catch (err) {
        setError("Error loading contract data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);
  const fetchContractHistory = async (contractId: number) => {
    setHistoryLoading(contractId);
    try {
      const response = await fetch(`/api/contract/history?originalId=${contractId}`);
      if (!response.ok) throw new Error("Failed to fetch history");
      const data = await response.json();
      console.log('Историја промена:', data);
      setHistoryData(prev => ({ ...prev, [contractId]: data }));
    } catch (err) {
      toast.error("Error loading contract history");
    } finally {
      setHistoryLoading(null);
    }
  };

  const handleRowClick = async (contractId: number) => {
    if (expandedContractId === contractId) {
      setExpandedContractId(null);
    } else {
      setExpandedContractId(contractId);
      if (!historyData[contractId]) {
        await fetchContractHistory(contractId);
      }
    }
  };
  const checkExpirationDates = () => {
    const today = new Date();
    contractsData.forEach((contract) => {
      const expirationDate = new Date(contract.datumIstekka);
      if (isNaN(expirationDate.getTime())) return;

      const diffTime = expirationDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 3600 * 24));

      if (diffDays >= 0 && diffDays <= 30) {
        showNotification(contract, diffDays, "expiring");
      } else if (diffDays < 0 && Math.abs(diffDays) <= 30) {
        showNotification(contract, Math.abs(diffDays), "expired");
      }
    });
  };

  useEffect(() => {
    if (contractsData.length > 0) checkExpirationDates();
  }, [contractsData]);

  const showNotification = (contract: any, diffDays: number, type: "expiring" | "expired") => {
    const orgName = contract.humanitarnaOrganizacija || "Unknown Organization";
    const kratkiBroj = contract.kratkiBroj || "nepoznat broj";
    
    toast[type === "expiring" ? "info" : "error"](
      `Ugovor za "${orgName}" "${kratkiBroj}" ${type === "expiring" ? "ističe" : "istekao"} za ${diffDays} dana!`, 
      {
        position: "top-right",
        autoClose: 15000,
        ...(type === "expired" && { style: { backgroundColor: "orange" } })
      }
    );
  };

  const handleFormSubmit = async (newContract: any) => {
    try {
      const response = await fetch("/api/contract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newContract),
      });

      const text = await response.text();
      const data = JSON.parse(text);

      if (response.ok) {
        toast.success(data.message);
        await refreshData(); // Osvežavanje podataka nakon dodavanja
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Došlo je do greške pri komunikaciji sa serverom");
    }
  };

  const handleEditContract = (contractId: number) => {
    setSelectedContractId(contractId);
    setIsUpdateDialogOpen(true);
  };  

 return (
  <Layout className="relative">
    <Box sx={{ padding: 2 }}>
      <Typography variant="h4" gutterBottom sx={{ borderBottom: "1px solid black", paddingBottom: 2, marginBottom: 4 }}>
        Humanitarni ugovori
      </Typography>

      <NavbarMulti activeView={activeView} setActiveView={setActiveView} viewsConfig={contractViewsConfig} />
      <Typography variant="h4" gutterBottom>
        {contractViewsConfig.find((view) => view.name === activeView)?.title}
      </Typography>

      <Button variant="contained" color="primary" onClick={() => setOpenForm(true)} sx={{ mb: 4 }}>
        Dodaj novi ugovor
      </Button>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error" sx={{ mt: 4, textAlign: "center" }}>
          {error}
        </Typography>
      ) : (
        <TableContainer component={Paper}>
  <Table>
    <TableHead>
      <TableRow>
        <TableCell/>
        <TableCell>Organizacija</TableCell>
        <TableCell>Ugovor</TableCell>
        <TableCell>Aneks 1</TableCell>
        <TableCell>Početak</TableCell>
        <TableCell>Istek</TableCell>
        <TableCell>Kratki broj</TableCell>
        <TableCell>Telefon</TableCell>
        <TableCell>Email</TableCell>
        <TableCell>PIB</TableCell>
        <TableCell>Račun</TableCell>
        <TableCell>Banka</TableCell>
        <TableCell>MB</TableCell>
        <TableCell>Kreirao</TableCell>
        <TableCell>Akcije</TableCell>
      </TableRow>
    </TableHead>
    <TableBody>
      {contractsData.map((contract) => [
        <TableRow 
          key={contract.id} 
          hover 
          onClick={() => handleRowClick(contract.id)}
          sx={{ '& > *': { borderBottom: 'unset' } }}
        >
          <TableCell>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleRowClick(contract.id);
              }}
            >
              {expandedContractId === contract.id ? 
                <KeyboardArrowUpIcon /> : 
                <KeyboardArrowDownIcon />}
            </IconButton>
          </TableCell>
          <TableCell>{contract.humanitarnaOrganizacija || "N/A"}</TableCell>
          <TableCell>{contract.ugovor || "N/A"}</TableCell>
          <TableCell>{contract.aneks_1 || "N/A"}</TableCell>
          <TableCell>
            {contract.datumPocetka ? 
              new Date(contract.datumPocetka).toLocaleDateString('sr-RS') : "N/A"}
          </TableCell>
          <TableCell>
            {contract.datumIstekka ? 
              new Date(contract.datumIstekka).toLocaleDateString('sr-RS') : "N/A"}
          </TableCell>
          <TableCell>{contract.kratkiBroj || "N/A"}</TableCell>
          <TableCell>{contract.telefon || "N/A"}</TableCell>
          <TableCell>{contract.email || "N/A"}</TableCell>
          <TableCell>{contract.pib || "N/A"}</TableCell>
          <TableCell>{contract.racun || "N/A"}</TableCell>
          <TableCell>{contract.banka || "N/A"}</TableCell>
          <TableCell>{contract.mb || "N/A"}</TableCell>
          <TableCell>{contract.user?.name || "N/A"}</TableCell>
          <TableCell>
            <Button
              variant="contained"
              color="secondary"
              onClick={(e) => {
                e.stopPropagation();
                handleEditContract(contract.id);
              }}
            >Izmeni</Button>
          </TableCell>
        </TableRow>,
        <TableRow key={`${contract.id}-history`}>
  <TableCell colSpan={14} sx={{ py: 0 }}>
    <Collapse in={expandedContractId === contract.id}>
      <Box sx={{ m: 2 }}>
        <Typography variant="h6" gutterBottom>Istorija promena</Typography>
        {historyLoading === contract.id ? (
          <CircularProgress/>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: '20%' }}>Datum promene</TableCell>
                <TableCell sx={{ width: '60%' }}>Promenjeni podaci</TableCell>
                <TableCell sx={{ width: '20%' }}>Korisnik</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {historyData[contract.id]?.map((history) => {
                const getFieldLabel = (field: string) => {
                  const labels: Record<string, string> = {
                    'humanitarnaOrganizacija': 'Organizacija',
                    'ugovor': 'Broj ugovora',
                    'datumPocetka': 'Datum početka',
                    'datumIstekka': 'Datum isteka',
                    'kratkiBroj': 'Kratki broj',
                    'telefon': 'Telefon',
                    'email': 'Email',
                    'pib': 'PIB',
                    'racun': 'Račun',
                    'banka': 'Banka',
                    'mb': 'MB',
                    'aneks_1': 'Aneks 1'
                  };
                  return labels[field] || field;
                };

                return (
                  <TableRow key={history.id}>
                    <TableCell>
                      {new Date(history.datumPromene).toLocaleString('sr-RS', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </TableCell>
                    <TableCell>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {/* Osnovni podaci */}
                        <div><strong>Organizacija:</strong> {history.humanitarnaOrganizacija}</div>
                        <div><strong>Ugovor:</strong> {history.ugovor}</div>
                        <div><strong>Kratki broj:</strong> {history.kratkiBroj}</div>

                        {/* Lista promena */}
                        {history.promene && Object.entries(history.promene).map(([field, values]) => (
                          <div key={field} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                            <span style={{ fontWeight: 500 }}>{getFieldLabel(field)}:</span>
                            <span style={{ textDecoration: 'line-through', color: '#ff4444', padding: '2px 4px', background: '#fff0f0', borderRadius: 4 }}>
                              {values.old || 'N/A'}
                            </span>
                            <span style={{ color: '#666', fontSize: '0.9em' }}>→</span>
                            <span style={{ color: '#00c851', padding: '2px 4px', background: '#f0fff4', borderRadius: 4 }}>
                              {values.new || 'N/A'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <PersonIcon fontSize="small" />
                        {history.korisnik}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </Box>
    </Collapse>
  </TableCell>
</TableRow>
      ])}
    </TableBody>
  </Table>
</TableContainer>
      )}

      <ToastContainer />
    </Box>

    <Form open={openForm} handleClose={() => setOpenForm(false)} handleSubmit={handleFormSubmit} />

    {isUpdateDialogOpen && (
      <UpdateContractForm 
        open={isUpdateDialogOpen}
        contractId={selectedContractId!}
        onClose={() => setIsUpdateDialogOpen(false)}
        onUpdate={refreshData}
      />
    )}
  </Layout>
);