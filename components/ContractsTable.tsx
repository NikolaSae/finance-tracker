// components/ContractsTable.tsx
"use client";
import React, { useState, useCallback } from "react";
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
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import PersonIcon from '@mui/icons-material/Person';
import { toast } from "react-toastify";

interface Contract {
  id: number;
  humanitarnaOrganizacija: string;
  ugovor: string;
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

interface HistoryEntry {
  id: number;
  datumPromene: string;
  promene: Record<string, { old?: string; new?: string }>;
  korisnik: string;
}

interface ContractsTableProps {
  contracts: Contract[];
  historyData: { [key: number]: HistoryEntry[] };
  loadHistory: (contractId: number) => Promise<void>;
  loadingHistoryId: number | null;
  onEdit: (contractId: number) => void;
}

const getRowStyle = (datumIstekka: string) => {
  const today = new Date();
  const expirationDate = new Date(datumIstekka);
  if (isNaN(expirationDate.getTime())) return {};
  const diffTime = expirationDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 3600 * 24));
  if (Math.abs(diffDays) <= 30) return { backgroundColor: '#ffebee' };
  return {};
};

export default function ContractsTable({ contracts, historyData, loadHistory, loadingHistoryId, onEdit }: ContractsTableProps) {
  const [expandedContractId, setExpandedContractId] = useState<number | null>(null);

  const handleRowClick = useCallback(async (contractId: number) => {
    if (expandedContractId === contractId) {
      setExpandedContractId(null);
    } else {
      setExpandedContractId(contractId);
      if (!historyData[contractId]) {
        try {
          await loadHistory(contractId);
        } catch (err) {
          toast.error("Greška pri učitavanju istorije");
        }
      }
    }
  }, [expandedContractId, historyData, loadHistory]);

  return (
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
          {contracts.map((contract) => (
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
                    {expandedContractId === contract.id ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                  </IconButton>
                </TableCell>
                <TableCell>{contract.humanitarnaOrganizacija}</TableCell>
                <TableCell>{contract.ugovor}</TableCell>
                <TableCell>{new Date(contract.datumPocetka).toLocaleDateString('sr-RS')}</TableCell>
                <TableCell>{new Date(contract.datumIstekka).toLocaleDateString('sr-RS')}</TableCell>
                <TableCell>{contract.kratkiBroj}</TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(contract.id);
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
                      {loadingHistoryId === contract.id ? (
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
                                <TableCell>{new Date(history.datumPromene).toLocaleString('sr-RS')}</TableCell>
                                <TableCell>
                                  {Object.entries(history.promene).map(([field, values]) => (
                                    <div key={field} style={{ display: 'flex', gap: 8 }}>
                                      <span style={{ textDecoration: 'line-through' }}>{values.old || 'N/A'}</span>
                                      →
                                      <span style={{ fontWeight: 'bold' }}>{values.new || 'N/A'}</span>
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
  );
}
