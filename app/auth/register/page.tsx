// /app/auth/register/page.tsx

"use client";
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { TextField, Button, Box, Typography, Container, Paper } from '@mui/material';
import { toast } from 'react-toastify';

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData(event.target as HTMLFormElement);
      const name = formData.get('name')?.toString().trim() || '';
      const email = formData.get('email')?.toString().trim() || '';
      const password = formData.get('password')?.toString().trim() || '';

      if (!name || !email || !password) {
        toast.error('Molimo popunite sva polja');
        return;
      }

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, name }),
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Došlo je do greške prilikom registracije');
      }

      toast.success('Uspešno ste se registrovali!');
      setTimeout(() => router.push('/auth/login'), 100);

    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Neočekivana greška');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 8 }}>
        <Typography variant="h4" align="center" gutterBottom>
          Registracija
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            name="email"
            label="Email"
            type="email"
            required
            fullWidth
            autoComplete="email"
          />
          <TextField
            name="name"
            label="Име и презиме"
            required
            fullWidth
            autoComplete="name"
          />
          <TextField
            name="password"
            label="Lozinka"
            type="password"
            required
            fullWidth
            autoComplete="new-password"
            inputProps={{ minLength: 8 }}
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={isLoading}
            sx={{ mt: 2 }}
          >
            {isLoading ? 'Registracija u toku...' : 'Registruj se'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}
