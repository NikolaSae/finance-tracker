"use client";
import { useState, useEffect } from "react";
import { Box, Button, ButtonGroup, AppBar, Toolbar, Typography, Drawer, IconButton, Select, MenuItem, FormControl, InputLabel, CircularProgress } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import { useSession } from "next-auth/react"; // Import useSession for session handling

export default function NavbarPro({ providers, activeProvider, setActiveProvider }) {
  const { data: session } = useSession(); // Get session data
  const [buttonStyles, setButtonStyles] = useState({});
  const [mobileOpen, setMobileOpen] = useState(false);
  const [groupBy, setGroupBy] = useState("all"); // Group by 'all' initially
  const [selectedProvider, setSelectedProvider] = useState(""); // To store selected provider
  const [groupingMethod, setGroupingMethod] = useState("month"); // Grouping by month by default
  const [loading, setLoading] = useState(true); // Loading state to handle asynchronous data

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  useEffect(() => {
    if (session?.user?.activeProvider) {
      setActiveProvider(session.user.activeProvider);
    }
  }, [session, setActiveProvider]);

  useEffect(() => {
    if (providers.length > 0) {
      setLoading(false); // Data has been loaded
    }
    const newButtonStyles = {};
    providers.forEach((provider) => {
      newButtonStyles[provider] = {
        textTransform: "none",
        width: "auto",
        minWidth: "120px",
        padding: "6px 16px",
        color: activeProvider === provider ? "white" : "black",
        backgroundColor: activeProvider === provider ? "green" : "transparent",
        borderLeft: activeProvider === provider ? "1px solid black !important" : "none",
        borderLeft: activeProvider === provider ? "0.2px solid white !important" : "0.2px solid black !important",
        borderRadius: "none",
        borderRight: activeProvider === provider ? "0.2px solid white !important" : "none",
        outline: activeProvider === provider ? "none" : "2px solid transparent !important",
        transition: "all 0.3s ease !important",
        "&:hover": {
          border: "none",
          boxShadow: "0px 6px 12px rgba(255, 255, 255, 0.4) !important",
          color: activeProvider === provider ? "white" : "white",
        },
        textShadow: activeProvider === provider
          ? "0px 5px 5px rgba(0, 0, 0, 1)"
          : "0px 3px 3px rgba(0, 0, 0, 0.3)",
      };
    });
    setButtonStyles(newButtonStyles);
  }, [activeProvider, providers, session]);

  const handleGroupByChange = (event) => {
    setGroupBy(event.target.value);
  };

  const handleProviderChange = (event) => {
    setSelectedProvider(event.target.value);
    setActiveProvider(event.target.value); // Set active provider when selected
  };

  const handleGroupingMethodChange = (method) => {
    setGroupingMethod(method); // Toggle grouping method between 'month' and 'year'
  };

  const drawerContent = (
    <Box sx={{ width: 250 }}>
      <Typography variant="h6" sx={{ marginBottom: 2, padding: 2 }}>
        Provajderi
      </Typography>

      {/* Loading State: Show a loading spinner if the data is still being loaded */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", padding: 2 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Dropdown for selecting provider */}
          <FormControl fullWidth sx={{ marginBottom: 2 }}>
            <InputLabel id="provider-select-label">Izaberite Provajdera</InputLabel>
            <Select
              labelId="provider-select-label"
              value={selectedProvider}
              onChange={handleProviderChange}
              label="Izaberite Provajdera"
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {providers.map((provider) => (
                <MenuItem key={provider} value={provider}>
                  {provider}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Group by Dropdown */}
          <FormControl fullWidth sx={{ marginBottom: 2 }}>
            <InputLabel id="groupby-select-label">Grupisanje</InputLabel>
            <Select
              labelId="groupby-select-label"
              value={groupBy}
              onChange={handleGroupByChange}
              label="Grupisanje"
            >
              <MenuItem value="all">Svi</MenuItem>
              <MenuItem value="month">Po mesecu</MenuItem>
              <MenuItem value="year">Po godini</MenuItem>
              <MenuItem value="provaider">Po provajderu</MenuItem>
            </Select>
          </FormControl>

          {/* Grouping method buttons */}
          <ButtonGroup variant="outlined" sx={{ width: "100%" }}>
            <Button
              onClick={() => handleGroupingMethodChange("month")}
              sx={{
                backgroundColor: groupingMethod === "month" ? "#1976d2" : "transparent",
                color: groupingMethod === "month" ? "white" : "black",
              }}
            >
              Po mesecu
            </Button>
            <Button
              onClick={() => handleGroupingMethodChange("year")}
              sx={{
                backgroundColor: groupingMethod === "year" ? "#1976d2" : "transparent",
                color: groupingMethod === "year" ? "white" : "black",
              }}
            >
              Po godini
            </Button>
          </ButtonGroup>
        </>
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
          "& .MuiDrawer-paper": {
            width: 250,
          },
          display: { xs: "block", md: "none" },
        }}
      >
        <Box sx={{ padding: 2 }}>
          <IconButton
            onClick={handleDrawerToggle}
            sx={{ position: "absolute", top: 10, right: 10 }}
          >
            <CloseIcon />
          </IconButton>
          {drawerContent}
        </Box>
      </Drawer>

      {/* Desktop AppBar */}
      <AppBar position="static" sx={{ display: { xs: "none", md: "flex" } }}>
        <Toolbar sx={{ border: "1px solid black", height: '0x', margin: '0 0', backgroundColor: 'green' }}>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Provajderi
          </Typography>
          <ButtonGroup variant="text" aria-label="provider buttons" sx={{ display: "flex", justifyContent: "center", width: "100%" }}>
            {providers.map((provider) => (
              <Button
                key={provider}
                onClick={() => setActiveProvider(provider)}
                variant={activeProvider === provider ? "contained" : "outlined"}
                sx={buttonStyles[provider]}
              >
                {provider}
              </Button>
            ))}
          </ButtonGroup>
        </Toolbar>
      </AppBar>

      {/* Mobile Menu Icon */}
      <IconButton
        color="inherit"
        edge="start"
        onClick={handleDrawerToggle}
        sx={{
          display: { xs: "block", md: "none" },
          position: "absolute",
          left: 10,
          top: 10,
        }}
      >
        <MenuIcon />
      </IconButton>
    </>
  );
}
