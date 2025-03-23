"use client";

import { useTheme } from "next-themes";
import { Button } from "@mui/material";

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  return (
    <Button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
      Toggle Theme
    </Button>
  );
}