"use client";
import { useState, useEffect } from "react";
import {
  TextField,
  MenuItem,
  Box,
  Typography,
  TableContainer,
  Paper,
  InputAdornment,
  Checkbox,
  FormControl,
  FormControlLabel,
  InputLabel,
  Select,
  ListItemText,
} from "@mui/material";
import { Search } from "@mui/icons-material";
import type { SelectChangeEvent } from "@mui/material";

interface DataRow {
  [key: string]: string | number | Date;
  id?: string;
  created_at?: string;
  updated_at?: string;
  amount?: number;
}

export default function DataViewerPage() {
  const [selectedLists, setSelectedLists] = useState<string[]>(["transactions"]);
  const [data, setData] = useState<DataRow[]>([]);
  const [filter, setFilter] = useState<string>("");
  const [showAllColumns, setShowAllColumns] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      const results = await Promise.all(
        selectedLists.map((list) =>
          fetch(`/api/data?list=${list}`)
            .then((res) => res.json())
            .catch(() => [])
        )
      );
      setData(results.flat());
    };
    fetchData();
  }, [selectedLists]);

  // Handle list selection changes
  const handleListChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    setSelectedLists(typeof value === "string" ? value.split(",") : value);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Admin Data Viewer
      </Typography>

      <Box sx={{ mb: 3 }}>
        <FormControl fullWidth>
          <InputLabel shrink>Select Data Tables</InputLabel>
          <Select
            multiple
            value={selectedLists}
            onChange={handleListChange}
            renderValue={(selected) => (selected as string[]).join(", ")}
          >
            {["transactions", "users", "vas_postpaid"].map((list) => (
              <MenuItem key={list} value={list}>
                <Checkbox checked={selectedLists.includes(list)} />
                <ListItemText primary={list} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Box sx={{ mb: 3 }}>
        <TextField
          label="Global Filter"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          fullWidth
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      <Box sx={{ mb: 3 }}>
        <FormControlLabel
          control={
            <Checkbox
              checked={showAllColumns}
              onChange={(e) => setShowAllColumns(e.target.checked)}
            />
          }
          label="Show all columns"
        />
      </Box>

      <Box sx={{ display: "flex", justifyContent: "center" }}>
        <TableContainer component={Paper} sx={{ maxWidth: 800 }}>
          {/* Table implementation would go here */}
        </TableContainer>
      </Box>
    </Box>
  );
}