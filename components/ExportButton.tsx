// components/ExportButton.tsx
"use client";

import { useState } from 'react';
import { toast } from 'react-toastify';
import { Select, MenuItem, FormControl, InputLabel, Button } from '@mui/material';

export default function ExportButton() {
  const [loading, setLoading] = useState(false);
  const [selectedList, setSelectedList] = useState('transactions');

  const handleExport = async () => {
    if (!selectedList) {
      toast.error('Odaberite listu za izvoz');
      return;
    }

    const confirmed = window.confirm(`Da li želite da izvezete listu: ${selectedList}?`);
    if (!confirmed) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/export?list=${selectedList}`);
      
      if (!response.ok) throw new Error('Greška pri izvozu');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${selectedList}_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(`Uspešno izvezena lista: ${selectedList}`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Došlo je do greške pri izvozu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-4 items-center">
      <FormControl variant="outlined" size="small" sx={{ minWidth: 200 }}>
        <InputLabel>Lista za izvoz</InputLabel>
        <Select
          value={selectedList}
          onChange={(e) => setSelectedList(e.target.value)}
          label="Lista za izvoz"
        >
          <MenuItem value="transactions">Transakcije</MenuItem>
          <MenuItem value="users">Korisnici</MenuItem>
          <MenuItem value="invoices">Fakture</MenuItem>
        </Select>
      </FormControl>

      <Button
        variant="contained"
        onClick={handleExport}
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-700"
      >
        {loading ? 'Izvoženje...' : 'Izvezi Excel'}
      </Button>
    </div>
  );
}