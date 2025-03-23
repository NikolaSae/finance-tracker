"use client";

import { useTheme } from "next-themes";
import { Button } from "@mui/material";
import { LightMode, DarkMode } from "@mui/icons-material";

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant="outlined"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      startIcon={theme === "dark" ? <LightMode /> : <DarkMode />}
      sx={{
        position: 'fixed',
        bottom: 16,
        right: 16,
        zIndex: 9999
      }}
    >
      {theme === "dark" ? "Svetli režim" : "Tamni režim"}
    </Button>
  );
}