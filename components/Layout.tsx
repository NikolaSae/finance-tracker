// components/Layout.tsx
"use client";
import { Container, Grid } from '@mui/material';
import Navbar from './Navbar';
import React from 'react'; // Додајте овај ред

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <Container
        maxWidth={false}
        sx={{
          padding: '16px !important',
          maxWidth: '100% !important',
          minHeight: 'calc(100vh - 64px)'
        }}
      >
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <div className="content-wrapper">
              {children}
            </div>
          </Grid>
        </Grid>
      </Container>
    </div>
  );
}