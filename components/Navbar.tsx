"use client";
import { useState } from 'react';
import { AppBar, Toolbar, Typography, Button, Drawer, IconButton, Box } from '@mui/material';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import MenuIcon from '@mui/icons-material/Menu';
import { Close as CloseIcon } from '@mui/icons-material';

export default function Navbar() {
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/auth/login' }); // Redirects to login page after sign out
  };

  const drawerContent = (
    <Box sx={{ width: 250 }}>
      <Typography variant="h6" sx={{ marginBottom: 2 }}>
        FinApp - HUB za izveštavanje i monitoring
      </Typography>
      {session ? (
        <>
          <Button color="inherit" component={Link} href="/dashboard" fullWidth>
            Početna
          </Button>
          <Button color="inherit" component={Link} href="/dashboard/vas-postpaid-summary" fullWidth>
            Postpaid test
          </Button>
          <Button color="inherit" component={Link} href="/dashboard/reports" fullWidth>
            import/export
          </Button>
          <Button color="inherit" component={Link} href="/dashboard/statistics" fullWidth>
            Statistika
          </Button>
          <Button color="inherit" component={Link} href="/dashboard/humanitarni" fullWidth>
            humanitarni
          </Button>
          <Button color="inherit" component={Link} href="/dashboard/data-viewer" fullWidth>
            Data Viewer
          </Button>
          {/* Dodata nova stavka za Multi View */}
          <Button color="inherit" component={Link} href="/dashboard/multiview" fullWidth>
            vas postpaid
          </Button>
          <Button color="inherit" onClick={handleSignOut} fullWidth>
            odjava
          </Button>
        </>
      ) : (
        <Button color="inherit" component={Link} href="/auth/login" fullWidth>
          Login
        </Button>
      )}
    </Box>
  );

  return (
    <>
      {/* Mobile Drawer */}
      <Drawer
        anchor="left"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        sx={{
          '& .MuiDrawer-paper': {
            width: 250,
          },
          display: { xs: 'block', md: 'none' },
        }}
      >
        <Box sx={{ padding: 2 }}>
          <IconButton
            onClick={handleDrawerToggle}
            sx={{ position: 'absolute', top: 10, right: 10 }}
          >
            <CloseIcon />
          </IconButton>
          {drawerContent}
        </Box>
      </Drawer>

      {/* Desktop AppBar */}
      <AppBar position="static" sx={{ display: { xs: 'none', md: 'flex' } }}>
        <Toolbar sx={{ border: "1px solid black", height: '0x', margin: '0 0', backgroundColor: 'green' }}>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            FinApp - HUB za izveštavanje i monitoring
          </Typography>
          {session ? (
            <>
              <Button color="inherit" component={Link} href="/dashboard">
                Početna
              </Button>
              <Box sx={{ borderLeft: "1px solid black", height: '24px', margin: '0 8px' }} />
              <Button color="inherit" component={Link} href="/dashboard/vas-postpaid-summary">
                Postpaid test
              </Button>
              <Box sx={{ borderLeft: "1px solid black", height: '24px', margin: '0 8px' }} />
              <Button color="inherit" component={Link} href="/dashboard/reports">
                Import/export
              </Button>
              <Box sx={{ borderLeft: "1px solid black", height: '24px', margin: '0 8px' }} />
              <Button color="inherit" component={Link} href="/dashboard/customview">
                Trailer VAS
              </Button>
              <Box sx={{ borderLeft: "1px solid black", height: '24px', margin: '0 8px' }} />
              <Button color="inherit" component={Link} href="/dashboard/humanitarni">
                Humanitarni
              </Button>
              <Box sx={{ borderLeft: "1px solid black", height: '24px', margin: '0 8px' }} />
              <Button color="inherit" component={Link} href="/dashboard/statistics">
                Statistika
              </Button>
              <Box sx={{ borderLeft: "1px solid black", height: '24px', margin: '0 8px' }} />
              <Button color="inherit" component={Link} href="/dashboard/data-viewer">
                Data Viewer
              </Button>
              <Box sx={{ borderLeft: "1px solid black", height: '24px', margin: '0 8px' }} />
              <Button color="inherit" component={Link} href="/dashboard/multiview">
                VAS Postpaid
              </Button>
              <Box sx={{ borderLeft: "1px solid black", height: '24px', margin: '0 8px' }} />
              <Button color="inherit" onClick={handleSignOut}>
                odjava
              </Button>
            </>
          ) : (
            <Button color="inherit" component={Link} href="/auth/login">
              Prijava
            </Button>
          )}
        </Toolbar>
      </AppBar>

      {/* Mobile Menu Icon */}
      <IconButton
        color="inherit"
        edge="start"
        onClick={handleDrawerToggle}
        sx={{ display: { xs: 'block', md: 'none' }, position: 'absolute', left: 10, top: 10 }}
      >
        <MenuIcon />
      </IconButton>
    </>
  );
}
