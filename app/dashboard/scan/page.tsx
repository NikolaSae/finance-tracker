"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Box, Typography, Button, CircularProgress, Alert, Paper } from "@mui/material";
import ScanButton from "@/components/ScanButton";

export default function ScanPage() {
  const { data: session } = useSession();
  const [scanning, setScanning] = useState(false);
  const [scanResults, setScanResults] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleScanComplete = (results: any[]) => {
    setScanResults(results);
    setScanning(false);
  };

  const handleScanError = (message: string) => {
    setError(message);
    setScanning(false);
  };

  if (!session?.user) {
    return (
      <Box textAlign="center" p={4}>
        <Typography variant="h6">Morate biti prijavljeni da biste koristili skeniranje</Typography>
      </Box>
    );
  }

  return (
    <Box p={4}>
      <Typography variant="h4" gutterBottom>
        Skeniranje Ugovora
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <ScanButton 
          onStart={() => setScanning(true)}
          onComplete={handleScanComplete}
          onError={handleScanError}
          disabled={scanning}
        />
      </Paper>

      {scanning && (
        <Box textAlign="center" p={4}>
          <CircularProgress />
          <Typography variant="body1" mt={2}>
            Skeniranje u toku...
          </Typography>
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {scanResults.length > 0 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Rezultati skeniranja
          </Typography>
          <pre>{JSON.stringify(scanResults, null, 2)}</pre>
        </Paper>
      )}
    </Box>
  );
}
