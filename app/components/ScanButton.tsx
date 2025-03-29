"use client";

import { Button } from "@mui/material";
import { useState } from "react";

interface ScanResult {
  id: number;
  humanitarnaOrganizacija: string;
  status: string;
  isExpired: boolean;
  paymentOverdue: boolean;
}

interface ScanButtonProps {
  onStart: () => void;
  onComplete: (results: ScanResult[]) => void;
  onError: (message: string) => void;
  disabled?: boolean;
}

export default function ScanButton({
  onStart,
  onComplete,
  onError,
  disabled = false
}: ScanButtonProps) {
  const [isScanning, setIsScanning] = useState<boolean>(false);

  const handleScan = async () => {
    try {
      onStart();
      setIsScanning(true);
      
      const response = await fetch('/api/scan', {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error('Skeniranje nije uspelo');
      }

      const data = await response.json();
      onComplete(data.results);
    } catch (error) {
      console.error('Scan error:', error);
      onError(error instanceof Error ? error.message : 'Došlo je do greške');
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <Button
      variant="contained"
      color="primary"
      onClick={handleScan}
      disabled={disabled || isScanning}
      fullWidth
    >
      {isScanning ? 'Skeniranje...' : 'Pokreni Skeniranje'}
    </Button>
  );
}
