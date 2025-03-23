"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  Divider,
  Select,
  MenuItem,
  Button,
} from "@mui/material";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import Navbar from "@/components/Navbar";

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#8dd1e1"];

interface ProviderData {
  provider: string;
  count: number;
  amount: number;
}

interface ServiceData {
  name: string;
  count: number;
  amount: number;
}

const StatsPage = () => {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState<"vas_postpaid" | "bulkServisi" | "vas_servisi">("vas_postpaid");
  const [selectedPeriod, setSelectedPeriod] = useState("all");
  const [topProviders, setTopProviders] = useState<ProviderData[]>([]);
  const [topServices, setTopServices] = useState<ServiceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Generisanje poslednjih 12 meseci
  const months = Array.from({ length: 12 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    return {
      value: `${date.getMonth() + 1}-${date.getFullYear()}`,
      label: date.toLocaleString("sr-RS", { month: "long", year: "numeric" }),
    };
  }).reverse();

  const fetchStats = async (model: string) => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (selectedPeriod !== "all") {
        const [month, year] = selectedPeriod.split("-");
        params.append("month", month);
        params.append("year", year);
      }

      const [providersRes, servicesRes] = await Promise.all([
        fetch(`/api/stats/top-providers?model=${model}&${params.toString()}`),
        fetch(`/api/stats/top-services?model=${model}&${params.toString()}`)
      ]);

      if (!providersRes.ok || !servicesRes.ok) {
        throw new Error('Greška pri učitavanju podataka');
      }

      const providersData: ProviderData[] = await providersRes.json();
      const servicesData: ServiceData[] = await servicesRes.json();

      setTopProviders(providersData);
      setTopServices(servicesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nepoznata greška');
      console.error("Error fetching stats:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchStats(activeTab);
    }
  }, [activeTab, session, selectedPeriod]);

  if (status === "loading") {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <Navbar />
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom component="div">
          Statistički pregled
        </Typography>

        {/* Filteri */}
        <Box sx={{ mb: 3, display: "flex", alignItems: "center", gap: 2 }}>
          <Select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            sx={{ minWidth: 200 }}
          >
            <MenuItem value="all">Sve vreme</MenuItem>
            {months.map((month) => (
              <MenuItem key={month.value} value={month.value}>
                {month.label}
              </MenuItem>
            ))}
          </Select>
        </Box>

        {/* Tabovi */}
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          sx={{ mb: 3 }}
        >
          <Tab label="VAS Postpaid" value="vas_postpaid" />
          <Tab label="Bulk Servisi" value="bulkServisi" />
          <Tab label="VAS Servisi" value="vas_servisi" />
        </Tabs>

        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={3}>
            {/* Top Provajderi */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Top provajderi - {activeTab}
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={8}>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={topProviders}
                          dataKey="amount"
                          nameKey="provider"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          label={({ percent }) => 
                            percent > 0.05 ? `${(percent * 100).toFixed(0)}%` : ''
                          }
                        >
                          {topProviders.map((_, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value: number) => [
                            new Intl.NumberFormat('sr-RS', {
                              style: 'currency',
                              currency: 'RSD'
                            }).format(value),
                            "Iznos"
                          ]}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <List sx={{ maxHeight: 300, overflow: 'auto' }}>
                      {topProviders
                        .sort((a, b) => b.amount - a.amount)
                        .map((provider, index) => (
                          <div key={provider.provider}>
                            <ListItem>
                              <ListItemText
                                primary={`${index + 1}. ${provider.provider}`}
                                secondary={
                                  <>
                                    Iznos: {new Intl.NumberFormat('sr-RS', {
                                      style: 'currency',
                                      currency: 'RSD'
                                    }).format(provider.amount)}
                                    <br />
                                    Transakcije: {provider.count.toLocaleString('sr-RS')}
                                  </>
                                }
                              />
                            </ListItem>
                            {index < topProviders.length - 1 && <Divider />}
                          </div>
                        ))}
                    </List>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            {/* Top Servisi */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Top servisi - {activeTab}
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={8}>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={topServices}
                          dataKey="amount"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          label={({ percent }) => 
                            percent > 0.05 ? `${(percent * 100).toFixed(0)}%` : ''
                          }
                        >
                          {topServices.map((_, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value: number) => [
                            new Intl.NumberFormat('sr-RS', {
                              style: 'currency',
                              currency: 'RSD'
                            }).format(value),
                            "Iznos"
                          ]}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <List sx={{ maxHeight: 300, overflow: 'auto' }}>
                      {topServices
                        .sort((a, b) => b.amount - a.amount)
                        .map((service, index) => (
                          <div key={service.name}>
                            <ListItem>
                              <ListItemText
                                primary={`${index + 1}. ${service.name}`}
                                secondary={
                                  <>
                                    Iznos: {new Intl.NumberFormat('sr-RS', {
                                      style: 'currency',
                                      currency: 'RSD'
                                    }).format(service.amount)}
                                    <br />
                                    Količina: {service.count.toLocaleString('sr-RS')}
                                  </>
                                }
                              />
                            </ListItem>
                            {index < topServices.length - 1 && <Divider />}
                          </div>
                        ))}
                    </List>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        )}
      </Box>
    </>
  );
};

export default StatsPage;