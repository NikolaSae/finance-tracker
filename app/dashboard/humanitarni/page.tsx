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
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import NavbarMulti from "@/components/NavbarMulti";
import Form from "@/components/Form";
import UpdateContractForm from "@/components/UpdateContractForm";
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import PersonIcon from '@mui/icons-material/Person';
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const contractViewsConfig = [
  { name: "active_contracts", title: "Aktivni ugovori" },
  { name: "expired_contracts", title: "Neaktivni ugovori" },
];

const getRowStyle = (datumIstekka: string) => {
  const today = new Date();
  const expirationDate = new Date(datumIstekka);
  if (isNaN(expirationDate.getTime())) return {};
  const diffTime = expirationDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 3600 * 24));

  if (Math.abs(diffDays) <= 30) return { backgroundColor: '#ffebee' };
  return {};
};

interface Contract {
  id: number;
  humanitarnaOrganizacija: string;
  ugovor: string;
  aneks_1: string;
  datumPocetka: string;
  datumIstekka: string;
  kratkiBroj: string;
  telefon: string;
  email: string;
  pib: string;
  racun: string;
  banka: string;
  mb: string;
  user?: { name: string };
  updatedUser?: { name: string };
}

export default function HumanitarniPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeView, setActiveView] = useState(contractViewsConfig[0].name);
  const [contractsData, setContractsData] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openForm, setOpenForm] = useState(false);
  const [selectedContractId, setSelectedContractId] = useState<number | null>(null);
  const [expandedContractId, setExpandedContractId] = useState<number | null>(null);
  const [historyData, setHistoryData] = useState<{ [key: number]: any[] }>({});
  const [historyLoading, setHistoryLoading] = useState<number | null>(null);

  const refreshData = async () => {
    try {
      const response = await fetch("/api/contract", {
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      });
      
      if (response.status === 401) {
        router.push("/auth/login");
        return;
      }

      if (!response.ok) throw new Error("Greška pri učitavanju podataka");
      const data = await response.json();
      setContractsData(data);
    } catch (err) {
      setError("Greška pri učitavanju podataka");
    }
  };

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    } else if (status === "authenticated") {
      refreshData();
    }
  }, [status, router, session]);

  const fetchContractHistory = async (contractId: number) => {
    setHistoryLoading(contractId);
    try {
      const response = await fetch(`/api/contract/history?originalId=${contractId}`);
      if (!response.ok) throw new Error("Greška pri učitavanju istorije");
      const data = await response.json();
      setHistoryData(prev => ({ ...prev, [contractId]: data }));
    } catch (err) {
      toast.error("Greška pri učitavanju istorije");
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

  const handleFormSubmit = async (newContract: any) => {
    try {
      const response = await fetch("/api/contract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newContract),
      });

      if (!response.ok) throw new Error("Greška pri čuvanju ugovora");
      await refreshData();
      toast.success("Ugovor uspešno sačuvan");
    } catch (error) {
      toast.error("Došlo je do greške pri čuvanju ugovora");
    }
  };

  return (
    <Box sx={{ padding: 2 }}>
      <Typography variant="h4" gutterBottom sx={{ borderBottom: "1px solid black", paddingBottom: 2, marginBottom: 4 }}>
        Humanitarni ugovori
      </Typography>

      <NavbarMulti 
        activeView={activeView} 
        setActiveView={setActiveView} 
        viewsConfig={contractViewsConfig} 
      />

      <Button 
        variant="contained" 
        color="primary" 
        onClick={() => setOpenForm(true)}
        sx={{ mb: 4 }}
      >
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
                <TableCell />
                <TableCell>Organizacija</TableCell>
                <TableCell>Ugovor</TableCell>
                <TableCell>Datum početka</TableCell>
                <TableCell>Datum isteka</TableCell>
                <TableCell>Kratki broj</TableCell>
                <TableCell>Akcije</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {contractsData.map((contract) => (
                <React.Fragment key={contract.id}>
                  <TableRow
                    hover
                    onClick={() => handleRowClick(contract.id)}
                    sx={getRowStyle(contract.datumIstekka)}
                  >
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRowClick(contract.id);
                        }}
                      >
                        {expandedContractId === contract.id ? (
                          <KeyboardArrowUpIcon />
                        ) : (
                          <KeyboardArrowDownIcon />
                        )}
                      </IconButton>
                    </TableCell>
                    <TableCell>{contract.humanitarnaOrganizacija}</TableCell>
                    <TableCell>{contract.ugovor}</TableCell>
                    <TableCell>
                      {new Date(contract.datumPocetka).toLocaleDateString('sr-RS')}
                    </TableCell>
                    <TableCell>
                      {new Date(contract.datumIstekka).toLocaleDateString('sr-RS')}
                    </TableCell>
                    <TableCell>{contract.kratkiBroj}</TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        color="secondary"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedContractId(contract.id);
                        }}
                      >
                        Izmeni
                      </Button>
                    </TableCell>
                  </TableRow>
                  
                  <TableRow>
                    <TableCell colSpan={7} sx={{ py: 0 }}>
                      <Collapse in={expandedContractId === contract.id}>
                        <Box sx={{ m: 2 }}>
                          <Typography variant="h6" gutterBottom>
                            Istorija promena
                          </Typography>
                          {historyLoading === contract.id ? (
                            <CircularProgress />
                          ) : (
                            <Table size="small">
                              <TableHead>
                                <TableRow>
                                  <TableCell>Datum promene</TableCell>
                                  <TableCell>Promena</TableCell>
                                  <TableCell>Korisnik</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {historyData[contract.id]?.map((history) => (
                                  <TableRow key={history.id}>
                                    <TableCell>
                                      {new Date(history.datumPromene).toLocaleString('sr-RS')}
                                    </TableCell>
                                    <TableCell>
                                      {Object.entries(history.promene).map(([field, values]) => (
                                        <div key={field} style={{ display: 'flex', gap: 8 }}>
                                          <span style={{ textDecoration: 'line-through' }}>
                                            {values.old || 'N/A'}
                                          </span>
                                          →
                                          <span style={{ fontWeight: 'bold' }}>
                                            {values.new || 'N/A'}
                                          </span>
                                        </div>
                                      ))}
                                    </TableCell>
                                    <TableCell>
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <PersonIcon fontSize="small" />
                                        {history.korisnik}
                                      </Box>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          )}
                        </Box>
                      </Collapse>
                    </TableCell>
                  </TableRow>
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Form
        open={openForm}
        handleClose={() => setOpenForm(false)}
        handleSubmit={handleFormSubmit}
      />

      <UpdateContractForm
        open={!!selectedContractId}
        contractId={selectedContractId!}
        onClose={() => setSelectedContractId(null)}
        onUpdate={refreshData}
      />
    </Box>
  );
}