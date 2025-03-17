"use client";
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Layout from '@/components/Layout';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import {
  TextField,
  MenuItem,
  Box,
  Typography,
  CircularProgress
} from '@mui/material';

export default function StatisticsPage() {
  const { data: session } = useSession();
  const [filterType, setFilterType] = useState<string>('month'); // Default: Monthly view
  const [chartData, setChartData] = useState<{ label: string; total: number }[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (session) {
      const fetchChartData = async () => {
        setLoading(true);
        try {
          const res = await fetch(`/api/chart?filterType=${filterType}`);
          const data = await res.json();
          setChartData(data);
        } catch (error) {
          console.error('Failed to fetch chart data', error);
        }
        setLoading(false);
      };

      fetchChartData();
    }
  }, [filterType, session]);

  if (!session) {
    return <p>Access denied. Please log in.</p>;
  }

  return (
    <Layout>
      <Typography variant="h4" gutterBottom>
        Statistics
      </Typography>

      {/* Filter Dropdown */}
      <Box sx={{ mb: 3 }}>
        <TextField
          select
          label="Filter by"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          fullWidth
        >
          <MenuItem value="day">Daily</MenuItem>
          <MenuItem value="month">Monthly</MenuItem>
          <MenuItem value="year">Yearly</MenuItem>
        </TextField>
      </Box>

      {/* Loading Indicator */}
      {loading ? (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '400px'
          }}
        >
          <CircularProgress size={80} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Loading chart data...
          </Typography>
        </Box>
      ) : (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" />
            <YAxis
              domain={[
                Math.min(...chartData.map((d) => d.total)) * 1.1,
                Math.max(...chartData.map((d) => d.total)) * 1.1
              ]}
              tickFormatter={(value) => value.toLocaleString()}
            />
            <Tooltip />
            <Legend />
            <Bar dataKey="total" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
      )}
    </Layout>
  );
}
