"use client";

import { ThemeProvider as MuiThemeProvider, createTheme } from "@mui/material/styles";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { ReactNode } from "react";

// Kreirajte MUI teme za light i dark mode
const lightTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#1976d2", // Primarna boja za light mode
    },
    background: {
      default: "#ffffff", // Pozadina za light mode
    },
  },
});

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#90caf9", // Primarna boja za dark mode
    },
    background: {
      default: "#121212", // Pozadina za dark mode
    },
  },
});

export default function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <MuiThemeProvider theme={lightTheme}> {/* Primenite MUI temu */}
        {children}
      </MuiThemeProvider>
    </NextThemesProvider>
  );
}