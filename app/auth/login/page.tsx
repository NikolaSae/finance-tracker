"use client";
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { TextField, Button, Box, Typography, Container, Paper } from '@mui/material';
import { toast } from 'react-toastify';

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);

    const formData = new FormData(event.target as HTMLFormElement);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      toast.success('Prijava uspešna!');
      router.push('/dashboard');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Unexpected error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterClick = () => {
    router.push('/auth/register');
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 8 }}>
        <Typography variant="h4" align="center" gutterBottom>
          Prijava
        </Typography>
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          <TextField
            name="email"
            label="Email"
            type="email"
            required
            fullWidth
          />
          <TextField
            name="password"
            label="Lozinka"
            type="password"
            required
            fullWidth
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={isLoading}
            sx={{ mt: 2 }}
          >
            {isLoading ? 'Prijava u toku...' : 'Prijava'}
          </Button>
          
          <Button
            variant="outlined"
            fullWidth
            sx={{ mt: 2 }}
            onClick={handleRegisterClick}
          >
            Nov korisnik? Registruj se
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}
