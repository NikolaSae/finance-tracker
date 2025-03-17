"use client";
import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import NavbarMulti from "@/components/NavbarMulti";
import NavbarPro from "@/components/NavbarPro"; // Import new NavbarPro component
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
} from "@mui/material";
import { useSession } from "next-auth/react";  // Import useSession to get session data
import useFormattedMonth from "@/hooks/useFormattedMonth"; // Import the custom hook

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
    name: "placeholder3",
    title: "Coming Soon 3",
    columns: [],
    isPlaceholder: true
  }
] as const;


export default function MultiViewPage() {
  const { data: session, status } = useSession();  // Get session data
  const [activeView, setActiveView] = useState(viewsConfig[0].name); // Set the first view as default
  const [viewsData, setViewsData] = useState<{ [key: string]: any[] }>( 
    viewsConfig.reduce((acc, view) => ({
      ...acc,
      [view.name]: []
    }), {})
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeProvider, setActiveProvider] = useState("Svi"); // Define activeProvider state

  useEffect(() => {
    const fetchData = async () => {
      if (!session) return; // Prevent fetch if not logged in

      setLoading(true);
      setError("");

      if (["placeholder4", "placeholder2", "placeholder3"].includes(activeView)) {
        setLoading(false);
        return;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // 3-second timeout

      console.log("🔍 Fetching data from:", `/api/data/view/${activeView}`);

      try {
        const res = await fetch(`/api/data/view/${activeView}`, { signal: controller.signal });
        clearTimeout(timeoutId);

        console.log("✅ API Response Status:", res.status);

        if (!res.ok) throw new Error("Greška u API pozivu");

        const data = await res.json();
        console.log("📊 API Response Data:", data);

        setViewsData((prev) => {
          const updatedData = { ...prev, [activeView]: data };
          console.log("🔄 Updated viewsData:", updatedData);
          return updatedData;
        });
      } catch (err) {
        console.error("❌ Fetch error:", err);
        setError("Došlo je do greške pri učitavanju podataka");
      } finally {
        clearTimeout(timeoutId);
        setLoading(false);
      }
    };

    fetchData();
  }, [activeView, session]);

  // Use the custom hook to format the "Mesec pružanja usluge" data
  const formattedData = useFormattedMonth(viewsData[activeView]);

  // Create a list of all providers and add 'Svi' (All)
  const allProviders = [
    "Svi", // This is for showing all providers
    ...new Set(formattedData.map((row) => row["Provajder"])) // Get unique providers from 'Provajder' column
  ];

  // Filter the data based on the selected provider
  const filteredData = formattedData.filter((row) =>
    activeProvider === "Svi" || row["Provajder"] === activeProvider
  );

  if (status === "loading") {
    return <CircularProgress />; // Loading state for session
  }

  return (
    <Layout>
      {/* NavbarPro - Handles provider selection */}
      {session && (
        <Box sx={{ marginBottom: 5 }}>
          <NavbarPro
            providers={allProviders}  // Pass the list of providers to the navbar
            activeProvider={activeProvider}  // The currently selected provider
            setActiveProvider={setActiveProvider}  // Function to change the active provider
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
      <Box sx={{ marginBottom: 5}}>
        {session ? (
          <Typography variant="h6" color="primary">
            Welcome, {session.user.name || session.user.email} {/* Display user name or email */}
          </Typography>
        ) : (
          <Typography variant="h6" color="error">
            You are not logged in. Please log in to access the data.
          </Typography>
        )}
      </Box>

      <Typography variant="h4" gutterBottom sx={{
    mb: 4,
    backgroundColor: "#f0f0f0", // Change this to your preferred color
    padding: "10px", // Optional: Adds some padding to make the background color visible around the text
  }}>
        Finansijski Pregled
      </Typography>

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
  <TableContainer sx={{ border: "1px solid black", backgroundColor: '' }}>
  <Table size="small">
    <TableHead>
      <TableRow sx={{ borderBottom: "2px solid black", backgroundColor: 'lightgreen' }}>
        {view.columns.map((column, colIndex) => (
          <TableCell
            key={column}
            sx={{
              borderBottom: "2px solid black",
              backgroundColor: colIndex === 2 ? 'lightblue' : 'transparent', // Color the second column header
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
          <TableRow key={rowIndex} sx={{ borderBottom: "1px solid black" }}>
            {view.columns.map((column, colIndex) => (
              <TableCell
                key={column}
                sx={{
                  borderBottom: "1px solid black",
                  backgroundColor: colIndex === 2 ? 'lightyellow' : 'transparent', // Color the second column in body
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
    </Layout>
  );
}
