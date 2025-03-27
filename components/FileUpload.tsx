// components/FileUpload.tsx
'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Box, CircularProgress, Typography, Paper, Chip, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

interface ProcessingResult {
  status: 'success' | 'error';
  servisni_zahtev?: string;
  telefoni?: string[];
  servis?: string;
  datumi?: Record<string, string>;
  greske?: string[];
}

export default function FileUpload() {
  const [status, setStatus] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
    details?: unknown;
    logs?: string[];
  } | null>(null);

  const [isProcessing, setIsProcessing] = useState(false);

  const onDrop = useCallback(async (files: File[]) => {
    const file = files[0];
    if (!file) return;

    setIsProcessing(true);
    setStatus(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (result.success) {
        setStatus({
          message: result.message,
          type: 'success',
          details: result.data,
          logs: result.logs
        });
      } else {
        setStatus({
          message: result.error,
          type: 'error',
          details: result.details,
          logs: result.logs
        });
      }

    } catch (error) {
      setStatus({
        message: 'Došlo je do greške prilikom komunikacije sa serverom',
        type: 'error',
        details: error instanceof Error ? error.message : 'Nepoznata greška'
      });
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: {
      'message/rfc822': ['.eml'],
      'application/vnd.ms-outlook': ['.msg']
    }
  });

  return (
    <Box
      {...getRootProps()}
      sx={{
        position: 'fixed',
        bottom: 16,
        right: 16,
        width: 400,
        p: 2,
        bgcolor: 'background.paper',
        borderRadius: 2,
        boxShadow: 3,
        border: '2px dashed',
        borderColor: isDragActive ? 'primary.main' : 'divider',
        cursor: 'pointer',
        transition: 'border-color 0.3s'
      }}
    >
      <input {...getInputProps()} />
      
      <Typography variant="body2" color="textSecondary" textAlign="center">
        {isDragActive ? "Spustite fajl ovde..." : "Prevucite email prepisku ovde"}
      </Typography>

      {isProcessing && (
        <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <CircularProgress size={20} />
          <Typography variant="caption">Obrađujem fajl...</Typography>
        </Box>
      )}

      {status && (
        <Paper sx={{ 
          mt: 2, 
          p: 2,
          bgcolor: status.type === 'error' ? 'error.light' : 'success.light',
          color: status.type === 'error' ? 'error.contrastText' : 'success.contrastText'
        }}>
          <Typography variant="body2" gutterBottom>
            {status.message}
          </Typography>

          {status.logs && (
            <Accordion sx={{ mt: 1 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="caption">Detalji obrade</Typography>
              </AccordionSummary>
              <AccordionDetails>
                {status.logs.map((log, i) => (
                  <Chip
                    key={i}
                    label={log}
                    size="small"
                    sx={{ 
                      m: 0.5,
                      bgcolor: log.includes('GREŠKA') ? 'error.dark' : 'info.dark',
                      color: 'common.white'
                    }}
                  />
                ))}
              </AccordionDetails>
            </Accordion>
          )}

          {status.details && (
            <Accordion sx={{ mt: 2 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="caption">Rezultati obrade</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <pre style={{ fontSize: '0.75rem' }}>
                  {JSON.stringify(status.details, null, 2)}
                </pre>
              </AccordionDetails>
            </Accordion>
          )}
        </Paper>
      )}
    </Box>
  );
}
