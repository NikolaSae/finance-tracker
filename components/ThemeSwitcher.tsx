'use client'
import { useState, useEffect } from 'react';
import { Button } from '@mui/material';

export default function ThemeSwitcher() {
  const [isDark, setIsDark] = useState(false);

  // Prvo proverite lokalnu pohranu za trenutnu temu
  useEffect(() => {
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme) {
      setIsDark(storedTheme === 'dark');
    } else {
      // Ako tema nije postavljena, proverite sistemske preferencije
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDark(prefersDark);
    }
  }, []);

  // Promenite temu
  const toggleTheme = () => {
    const newTheme = !isDark ? 'dark' : 'light';
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark', !isDark); // Prebacivanje klase
    localStorage.setItem('theme', newTheme); // Sačuvajte temu u localStorage
  };

  return (
    <Button onClick={toggleTheme} variant="contained">
      {isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
    </Button>
  );
}
