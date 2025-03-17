"use client";
import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import {
  TextField,
  MenuItem,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TableSortLabel,
  InputAdornment,
  Checkbox,
  FormControl,
  FormControlLabel,
  InputLabel,
  Select,
  ListItemText,
} from "@mui/material";
import { Search } from "@mui/icons-material";

export default function DataViewerPage() {
  const [selectedLists, setSelectedLists] = useState<string[]>(["transactions"]);
  const [data, setData] = useState<any[]>([]);
  const [filter, setFilter] = useState<string>("");
  const [orderBy, setOrderBy] = useState<string>("transaction_date");
  const [order, setOrder] = useState<"asc" | "desc">("asc");
  const [columnFilters, setColumnFilters] = useState<{ [key: string]: string[] }>({});
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

  // Determine default columns
  let defaultColumns: string[] = [];
  if (data.length > 0) {
    defaultColumns = Object.keys(data[0]).filter(
      key => !['id', 'created_at', 'updated_at'].includes(key)
    );
  }

  const columnsToDisplay = showAllColumns && data.length > 0 
    ? Object.keys(data[0]) 
    : defaultColumns;

  // Sorting the data
  const sortedData = data.slice().sort((a, b) => {
    if (order === "asc") {
      return a[orderBy] > b[orderBy] ? 1 : -1;
    } else {
      return a[orderBy] < b[orderBy] ? 1 : -1;
    }
  });

  // Filtering the data
  const filteredData = sortedData.filter((row) => {
    const matchesGlobalFilter = Object.values(row).some((value) =>
      String(value).toLowerCase().includes(filter.toLowerCase())
    );

    const matchesColumnFilters = Object.keys(columnFilters).every((column) => {
      if (columnFilters[column].length === 0) return true;
      return columnFilters[column].includes(String(row[column]));
    });

    return matchesGlobalFilter && matchesColumnFilters;
  });

  // Calculating total amount (only if the amount field exists)
  const totalAmount = filteredData
    .reduce((sum, row) => sum + (row.amount ? parseFloat(row.amount) : 0), 0)
    .toFixed(2);

  // Handle sorting changes
  const handleSort = (column: string) => {
    const isAsc = orderBy === column && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(column);
  };

  // Handle list selection changes
  const handleListChange = (event: any) => {
    const value = event.target.value;
    setSelectedLists(typeof value === "string" ? value.split(",") : value);
  };

  return (
    <Layout>
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
          <Table>
            <TableHead>
              <TableRow>
                {columnsToDisplay.map((column) => (
                  <TableCell key={column}>
                    <TableSortLabel
                      active={orderBy === column}
                      direction={orderBy === column ? order : "asc"}
                      onClick={() => handleSort(column)}
                    >
                      {column}
                    </TableSortLabel>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredData.map((row, index) => (
                <TableRow key={index}>
                  {columnsToDisplay.map((column) => (
                    <TableCell key={column}>{row[column] ?? "N/A"}</TableCell>
                  ))}
                </TableRow>
              ))}
              {/* Show total if data contains the amount field (transactions only) */}
              {filteredData.length > 0 &&
                !showAllColumns &&
                defaultColumns.includes("amount") && (
                  <TableRow>
                    <TableCell colSpan={defaultColumns.length - 1} align="right">
                      <strong>Total:</strong>
                    </TableCell>
                    <TableCell>
                      <strong>{totalAmount}</strong>
                    </TableCell>
                  </TableRow>
                )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Layout>
  );
}
