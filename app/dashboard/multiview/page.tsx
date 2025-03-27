"use client";
import { useState, useEffect, useMemo } from "react";
import NavbarMulti from "@/components/NavbarMulti";
import NavbarPro from "@/components/NavbarPro";
import {
  Box,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button
} from "@mui/material";
import { useSession } from "next-auth/react";
import { utils, writeFile } from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// ==== UTILITY FUNCTIONS ====
interface FormattedViewRow {
  id?: string;
  Mesec_pruzanja_usluge: string;
  Provajder?: string;
  provider_name?: string;
  [key: string]: any;
}

const formatMonthData = (data: FormattedViewRow[]): FormattedViewRow[] => {
  if (!Array.isArray(data)) return [];

  return data.map(item => {
    try {
      const dateValue = item.Mesec_pruzanja_usluge;
      const formattedDate = new Date(dateValue).toLocaleDateString('sr-Latn-RS', {
        month: '2-digit',
        year: 'numeric'
      }).replace(/\./g, '-');

      return {
        ...item,
        Mesec_pruzanja_usluge: formattedDate
      };
    } catch (error) {
      console.error('Date formatting error:', error);
      return {
        ...item,
        Mesec_pruzanja_usluge: 'N/A'
      };
    }
  });
};
type ViewConfig = typeof viewsConfig[number];
type ExportFormat = 'csv' | 'excel' | 'pdf';

const viewsConfig = [
  { 
    name: "vas_postpaid_summary",
    title: "Postpaid Summary",
    columns: ["Mesec_pruzanja_usluge", "sum_Broj_transakcija", "sum_Fakturisan_iznos", "sum_Naplacen_iznos", "sum_Kumulativ_naplacenih_iznosa", "sum_Nenaplacen_iznos"],
    isPlaceholder: true
  },
  { 
    name: "v_ves_postpaid_bvc",
    title: "bvc", 
    columns: ["Provajder", "Mesec_pruzanja_usluge", "sum_broj_transakcija", "sum_fakturisan_iznos", "sum_naplacen_iznos", "sum_kumulativ_naplacenih_iznosa", "sum_nenaplacen_iznos"],
    isPlaceholder: false
  },
  { 
    name: "monthly_summary_with_provider",
    title: "monthly_summary_with_provider",
    columns: ["Provajder", "Mesec_pruzanja_usluge", "sum_Broj transakcija", "sum_Fakturisan_iznos", "sum_Naplacen_iznos", "sum_Kumulativ_naplacenih_iznosa", "sum_Nenaplacen_iznos"],
    isPlaceholder: true
  },
  { 
    name: "providermonthlysummary",
    title: "bulk test",
    columns: ["provider_name", "month", "total_services", "total_requests", "total_message_parts"],
    isPlaceholder: true
  }
] as const;

export default function MultiViewPage() {
  const { data: session, status } = useSession();
  const [activeView, setActiveView] = useState<ViewConfig['name']>(viewsConfig[0].name);
  const [viewsData, setViewsData] = useState<{ [key: string]: FormattedViewRow[] }>(
    viewsConfig.reduce((acc, view) => ({ ...acc, [view.name]: [] }), {})
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeProvider, setActiveProvider] = useState("Svi");

  useEffect(() => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const fetchData = async () => {
      if (!session || viewsData[activeView].length > 0) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const res = await fetch(`/api/data/view/${activeView}`, { 
          signal: controller.signal 
        });

        if (!res.ok) throw new Error("Greška u API pozivu");
        const data: ViewRow[] = await res.json();

        setViewsData(prev => ({
          ...prev,
          [activeView]: data
        }));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Došlo je do greške");
      } finally {
        clearTimeout(timeoutId);
        setLoading(false);
      }
    };

    fetchData();
    return () => {
      controller.abort();
      clearTimeout(timeoutId);
    };
  }, [activeView, session, viewsData]);

  // Hook-ovi se pozivaju na najvišem nivou funkcionalne komponente
  const formattedData = useMemo(
    () => formatMonthData(viewsData[activeView]),
    [viewsData, activeView]
  );

  const providerKey = useMemo(
    () => activeView === "providermonthlysummary" ? "provider_name" : "Provajder",
    [activeView]
  );

  const allProviders = useMemo(() => [
    "Svi",
    ...new Set(
      formattedData
        .map(row => row[providerKey])
        .filter(Boolean)
        .map(p => String(p))
    )
  ], [formattedData, providerKey]);

  const filteredData = useMemo(() => {
    if (activeProvider === "Svi") return formattedData;
    return formattedData.filter(row => 
      String(row[providerKey]) === String(activeProvider)
    );
  }, [formattedData, activeProvider, providerKey]);

  const getRowKey = (row: FormattedViewRow) => 
    row.id || `${row[providerKey]}_${row.Mesec_pruzanja_usluge}`;


  // Uklonite duplikat i koristite jednu funkciju:
const handleExport = (format: ExportFormat) => {
  if (filteredData.length === 0) {
    toast.error("Nema podataka za eksport");
    return;
  }

  const currentView = viewsConfig.find(view => view.name === activeView);
  if (!currentView) return;

  try {
    const filename = `${currentView.title}_${new Date()
      .toLocaleDateString('sr-RS')
      .replace(/\//g, '-')}`;

    const exportData = filteredData.map(row => {
      const newRow = { ...row };
      delete newRow.id;
      return newRow;
    });

    switch (format) {
      case 'csv':
      case 'excel': {
        const worksheet = utils.json_to_sheet(exportData);
        const workbook = utils.book_new();
        utils.book_append_sheet(workbook, worksheet, "Sheet1");
        writeFile(workbook, `${filename}.${format === 'csv' ? 'csv' : 'xlsx'}`);
        break;
      }
      case 'pdf': {
        const doc = new jsPDF();
        const columns = currentView.columns;
        const tableData = exportData.map(row => 
          columns.map(col => row[col] || "N/A")
        );
        autoTable(doc, {
          head: [columns],
          body: tableData,
        });
        doc.save(`${filename}.pdf`);
        break;
      }
      default:
        toast.error("Nepoznat format za eksport.");
    }
    
    toast.success(`Uspešno eksportovano u ${format.toUpperCase()}`);

  } catch (error) {
    console.error('Export Error:', error);
    toast.error('Greška pri eksportu podataka');
  }
};

 

  return (
  <Box sx={{ p: 3 }}>
    {/* NavbarPro - Handles provider selection */}
    {session && (
      <Box sx={{ marginBottom: 5 }}>
        <NavbarPro
          providers={allProviders}
          activeProvider={activeProvider}
          setActiveProvider={setActiveProvider}
        />
      </Box>
    )}

    {/* NavbarMulti - Handles view selection */}
    {session && (
      <Box sx={{ marginTop: 5 }}>
        <NavbarMulti 
          activeView={activeView} 
          setActiveView={setActiveView} 
          viewsConfig={viewsConfig} 
        />
      </Box>
    )}

    {/* Display user info from session */}
    <Box sx={{ marginBottom: 5 }}>
      {session ? (
        <Typography variant="h6" color="primary">
          Dobrodošli, {session.user.name || session.user.email}
        </Typography>
      ) : (
        <Typography variant="h6" color="error">
          You are not logged in. Please log in to access the data.
        </Typography>
      )}
    </Box>

    <Typography variant="h4" gutterBottom sx={{
      mb: 4,
      backgroundColor: "#f0f0f0",
      padding: "10px",
    }}>
      Finansijski Pregled
    </Typography>

    {/* Export Buttons */}
    <Box sx={{ marginBottom: 3 }}>
      <Button
        variant="contained"
        color="primary"
        onClick={() => handleExport('csv')}
        sx={{ marginRight: 2 }}
      >
        Export to CSV
      </Button>
      <Button
        variant="contained"
        color="secondary"
        onClick={() => handleExport('excel')}
        sx={{ marginRight: 2 }}
      >
        Export to Excel
      </Button>
      <Button
        variant="contained"
        color="default"
        onClick={() => handleExport('pdf')}
      >
        Export to PDF
      </Button>
    </Box>

    <Grid container spacing={3}>
      {viewsConfig
        .filter((view) => view.name === activeView)
        .map((view) => (
          <Grid item xs={12} key={view.name} sx={{ minHeight: 300 }}>
            <Paper elevation={3} sx={{ p: 2, height: "100%" }}>
              <Typography variant="h6" gutterBottom>
                {view.title}
              </Typography>

              {loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                  <CircularProgress />
                </Box>
              ) : error ? (
                <Typography color="error" sx={{ mt: 4, textAlign: "center" }}>
                  {error}
                </Typography>
              ) : filteredData.length === 0 && !loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%"}}>
                  <Typography variant="body1">U pripremi</Typography>
                </Box>
              ) : (
                <TableContainer sx={{ border: "1px solid black" }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ borderBottom: "2px solid black", backgroundColor: 'lightgreen' }}>
                        {view.columns.map((column, colIndex) => (
                          <TableCell
                            key={column}
                            sx={{
                              borderBottom: "2px solid black",
                              backgroundColor: colIndex === 2 ? 'lightblue' : 'transparent',
                            }}
                          >
                            {column}
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredData.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={view.columns.length} align="center">No data available</TableCell>
                        </TableRow>
                      ) : (
                        filteredData.map((row, rowIndex) => (
                          <TableRow key={getRowKey(row)} sx={{ borderBottom: "1px solid black" }}>
                            {view.columns.map((column, colIndex) => (
                              <TableCell
                                key={column}
                                sx={{
                                  borderBottom: "1px solid black",
                                  backgroundColor: colIndex === 2 ? 'lightyellow' : 'transparent',
                                }}
                              >
                                {row[column] || "N/A"}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Paper>
          </Grid>
        ))}
    </Grid>

    <ToastContainer
      position="bottom-right"
      autoClose={3000}
      hideProgressBar={false}
      newestOnTop
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
    />
  </Box>
);
}
// Sačuvajte sve komentare, importe i kod
