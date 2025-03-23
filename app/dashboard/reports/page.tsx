"use client";

import { useState, Suspense } from "react";
import { useSession } from "next-auth/react";
import {
  Box,
  Typography,
  Paper,
  Button,
  CircularProgress,
  Snackbar,
  Alert,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import Layout from "@/components/Layout";
import ExportButton from "@/components/ExportButton";
import GlobalLoading from "@/components/GlobalLoading";
import PuniButton from "@/components/PuniButton";
import ImportButton from "@/components/ImportButton";
import Navbar from "@/components/Navbar";

const ReportsPage = () => {
  const { data: session, status } = useSession();
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [loadingUpload, setLoadingUpload] = useState(false);
  const [loadingProcess, setLoadingProcess] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">(
    "success"
  );
  const [exportMessages, setExportMessages] = useState<string[]>([]); // Poruke za ExportButton
  const [puniMessages, setPuniMessages] = useState<string[]>([]); // Poruke za PuniButton
  const [importMessages, setImportMessages] = useState<string[]>([]); // Poruke za ImportButton
  const [processedCount, setProcessedCount] = useState<number>(0); // Broj obrađenih redova

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
      setFileName(event.target.files[0].name);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setSnackbarMessage("Molimo izaberite fajl.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }

    setLoadingUpload(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/bulk-import", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Greška prilikom upload-a fajla.");
      }

      const result = await response.json();
      setSnackbarMessage(result.message || "Fajl uspešno upload-ovan.");
      setSnackbarSeverity("success");
    } catch (error) {
      console.error("Greška prilikom upload-a:", error);
      setSnackbarMessage(
        error instanceof Error ? error.message : "Došlo je do greške."
      );
      setSnackbarSeverity("error");
    } finally {
      setLoadingUpload(false);
      setSnackbarOpen(true);
    }
  };

  const handleProcess = async () => {
    if (!fileName) {
      setSnackbarMessage("Nije upload-ovan fajl.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }

    setLoadingProcess(true);

    try {
      const response = await fetch("/api/process", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fileName }),
      });

      if (!response.ok) {
        throw new Error("Greška prilikom obrade fajla.");
      }

      const result = await response.json();
      setSnackbarMessage(result.message || "Uspešno obrađeni podaci.");
      setSnackbarSeverity("success");

      // Ažuriraj poruke i broj obrađenih redova
      if (result.output) {
        const outputLines = result.output.split("\n").filter((line: string) => line.trim() !== "");
        setImportMessages(outputLines);
        setProcessedCount(outputLines.length);
      }
    } catch (error) {
      console.error("Greška prilikom obrade:", error);
      setSnackbarMessage(
        error instanceof Error ? error.message : "Došlo je do greške."
      );
      setSnackbarSeverity("error");
    } finally {
      setLoadingProcess(false);
      setSnackbarOpen(true);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  // Ako korisnik nije prijavljen, prikaži poruku umesto forme
  if (status === "unauthenticated") {
    return (
      <>
        <Navbar />
        <Box sx={{ p: 3, textAlign: "center" }}>
          <Typography variant="h5" gutterBottom>
            Morate biti prijavljeni da biste pristupili ovoj stranici.
          </Typography>
          <Button variant="contained" href="/auth/login">
            Prijavi se
          </Button>
        </Box>
      </>
    );
  }

  // Ako se podaci o sesiji još uvek učitavaju, prikaži loader
  if (status === "loading") {
    return (
      <>
        <Navbar />
        <Box sx={{ p: 3, textAlign: "center" }}>
          <CircularProgress />
        </Box>
      </>
    );
  }

  return (
    <Layout>
      <Suspense fallback={<GlobalLoading />}>
        <h1>Reports</h1>
        <p>Here are your financial reports.</p>

        {/* Kontenjer za ExportButton i njegove logove */}
        <div className="mt-4">
          <ExportButton />
          <Paper sx={{ p: 3, mt: 3, maxWidth: 600 }}>
            <Typography variant="h6" gutterBottom>
              Export Logovi:
            </Typography>
            <List sx={{ maxHeight: 300, overflowY: "auto" }}>
              {exportMessages.map((message, index) => (
                <ListItem key={index}>
                  <ListItemText primary={message} />
                </ListItem>
              ))}
            </List>
          </Paper>
        </div>

        {/* Horizontalna linija za razdvajanje */}
        <hr className="my-6 border-t border-gray-300" />

        {/* Kontenjer za PuniButton i njegove logove */}
        <div className="mt-4">
          <PuniButton />
          <Paper sx={{ p: 3, mt: 3, maxWidth: 600 }}>
            <Typography variant="h6" gutterBottom>
              Puni Logovi:
            </Typography>
            <List sx={{ maxHeight: 300, overflowY: "auto" }}>
              {puniMessages.map((message, index) => (
                <ListItem key={index}>
                  <ListItemText primary={message} />
                </ListItem>
              ))}
            </List>
          </Paper>
        </div>

        {/* Horizontalna linija za razdvajanje */}
        <hr className="my-6 border-t border-gray-300" />

        {/* Kontenjer za ImportButton i njegove logove */}
        <div className="mt-4">
          <ImportButton />
          <Paper sx={{ p: 3, mt: 3, maxWidth: 600 }}>
            <Typography variant="h6" gutterBottom>
              Import Logovi:
            </Typography>
            <List sx={{ maxHeight: 300, overflowY: "auto" }}>
              {importMessages.map((message, index) => (
                <ListItem key={index}>
                  <ListItemText primary={message} />
                </ListItem>
              ))}
            </List>
            <Typography variant="body1" sx={{ mt: 2 }}>
              Ukupno obrađeno redova: {processedCount}
            </Typography>
          </Paper>
        </div>

        {/* Horizontalna linija za razdvajanje */}
        <hr className="my-6 border-t border-gray-300" />

        {/* Prozori za prikaz podataka */}
        <div className="grid grid-cols-2 gap-6 mt-6 w-full max-w-4xl">
          {/* PuniButton prozor */}
          <div className="p-4 bg-green-100 rounded-lg shadow-md min-h-[200px] w-full">
            <h3 className="font-semibold text-lg text-green-800">Ažurirani podaci</h3>
            <p className="text-gray-600">Ovde će biti prikazani podaci.</p>
          </div>

          {/* ImportButton prozor */}
          <div className="p-4 bg-gray-100 rounded-lg shadow-md min-h-[200px] w-full">
            <h3 className="font-semibold text-lg text-gray-800">Log poruke</h3>
            <p className="text-gray-600">Ovde će biti prikazane log poruke.</p>
          </div>
        </div>

        <Box sx={{ p: 3 }}>
          <Typography variant="h4" gutterBottom>
            Bulk Import Podataka
          </Typography>

          <Paper sx={{ p: 3, maxWidth: 600, margin: "auto" }}>
            <Typography variant="h6" gutterBottom>
              Izaberite CSV fajl za upload
            </Typography>

            <Box sx={{ mb: 3 }}>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                style={{ display: "none" }}
                id="file-upload"
              />
              <label htmlFor="file-upload">
                <Button variant="contained" component="span">
                  Izaberite Fajl
                </Button>
              </label>
              {file && (
                <Typography variant="body1" sx={{ mt: 1 }}>
                  Izabrani fajl: {file.name}
                </Typography>
              )}
            </Box>

            <Button
              variant="contained"
              color="primary"
              onClick={handleUpload}
              disabled={loadingUpload || !file}
              sx={{ mb: 2 }}
            >
              {loadingUpload ? <CircularProgress size={24} /> : "Upload Fajla"}
            </Button>

            <Button
              variant="contained"
              color="secondary"
              onClick={handleProcess}
              disabled={loadingProcess || !fileName}
            >
              {loadingProcess ? <CircularProgress size={24} /> : "Pokreni Obradu"}
            </Button>
          </Paper>
        </Box>

        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={handleSnackbarClose}
        >
          <Alert
            onClose={handleSnackbarClose}
            severity={snackbarSeverity}
            sx={{ width: "100%" }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Suspense>
    </Layout>
  );
};

export default ReportsPage;