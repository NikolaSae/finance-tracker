"use client";
import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TextField, MenuItem, Box, Typography, Button } from '@mui/material';

export default function StatisticsPage() {
  const [data, setData] = useState([]);
  const [year, setYear] = useState('');
  const [month, setMonth] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    let url = `/api/chart`;
    if (year || month) {
      url += `?${new URLSearchParams({ year, month }).toString()}`;
    }

    try {
      const res = await fetch(url);
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to fetch');

      // Format data for chart (group by day)
      const formattedData = result.map((row: any) => ({
        date: row.transaction_date.split('T')[0], // Keep only YYYY-MM-DD
        amount: row.amount
      }));

      setData(formattedData);
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Layout>
      <Typography variant="h4" gutterBottom>
        Statistics
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <TextField
          label="Year"
          type="number"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          sx={{ width: 120 }}
        />
        <TextField
          select
          label="Month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          sx={{ width: 120 }}
        >
          <MenuItem value="">All</MenuItem>
          {Array.from({ length: 12 }, (_, i) => (
            <MenuItem key={i + 1} value={i + 1}>{new Date(0, i).toLocaleString('default', { month: 'long' })}</MenuItem>
          ))}
        </TextField>
        <Button variant="contained" onClick={fetchData} disabled={loading}>
          {loading ? "Loading..." : "Apply Filters"}
        </Button>
      </Box>

      {/* Chart with fixed Y-axis scaling */}
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis 
            domain={[
              Math.min(...data.map(d => d.amount)) * 1.1, 
              Math.max(...data.map(d => d.amount)) * 1.1
            ]} 
            tickFormatter={(value) => value.toLocaleString()} 
          />
          <Tooltip />
          <Legend />
          <Bar dataKey="amount" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    </Layout>
  );
}
