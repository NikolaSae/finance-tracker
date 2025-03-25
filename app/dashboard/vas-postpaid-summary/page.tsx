// app/vas-postpaid-summary/page.tsx
"use client";
import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress
} from "@mui/material";

export default function VasPostpaidSummaryPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Definisanje kolona za prikaz
  const columns = [
    'Proizvod',
    'Mesec',
    'Ukupan Fakturisano',
    'Ukupan Naplaćeno',
    'Preostali Dug'
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/data/view/vas_postpaid_summary');
        if (!response.ok) throw new Error('Greška u API pozivu');
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError("Došlo je do greške pri učitavanju podataka");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
        Postpaid Summary
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                {columns.map((column) => (
                  <TableCell key={column}>{column}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((row, index) => (
                <TableRow key={index}>
                  <TableCell>{row.proizvod}</TableCell>
                  <TableCell>{row.mesec}</TableCell>
                  <TableCell>{row.ukupan_fakturisano}</TableCell>
                  <TableCell>{row.ukupan_naplaceno}</TableCell>
                  <TableCell>{row.preostali_dug}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}