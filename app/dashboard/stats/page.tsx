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
  const [activeTab, setActiveTab] = useState("vas_postpaid");
  const [selectedPeriod, setSelectedPeriod] = useState("all");
  const [topProviders, setTopProviders] = useState<ProviderData[]>([]);
  const [topServices, setTopServices] = useState<ServiceData[]>([]);
  const [loading, setLoading] = useState(true);

  // Generate last 12 months for the dropdown
  const months = Array.from({ length: 12 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    return {
      value: `${date.getMonth() + 1}-${date.getFullYear()}`,
      label: date.toLocaleString("default", { month: "long", year: "numeric" }),
    };
  }).reverse();

  const fetchStats = async (model: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedPeriod !== "all") {
        const [month, year] = selectedPeriod.split("-");
        params.append("month", month);
        params.append("year", year);
      }

      // Fetch top providers
      const providersRes = await fetch(
        `/api/stats/top-providers?model=${model}&${params.toString()}`
      );
      const providersData: ProviderData[] = await providersRes.json();
      setTopProviders(providersData);

      // Fetch top services
      const servicesRes = await fetch(
        `/api/stats/top-services?model=${model}&${params.toString()}`
      );
      const servicesData: ServiceData[] = await servicesRes.json();
      setTopServices(servicesData);
    } catch (error) {
      console.error("Error fetching stats:", error);
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
    return <CircularProgress />;
  }

  return (
    <>
      <Navbar />
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Statistički pregled
        </Typography>

        {/* Time Filter Section */}
        <Box sx={{ mb: 3, display: "flex", alignItems: "center", gap: 2 }}>
          <Select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            sx={{ minWidth: 200 }}
          >
            <MenuItem value="all">Sve vrijeme</MenuItem>
            {months.map((month) => (
              <MenuItem key={month.value} value={month.value}>
                {month.label}
              </MenuItem>
            ))}
          </Select>
          <Button
            variant={selectedPeriod === "all" ? "contained" : "outlined"}
            onClick={() => setSelectedPeriod("all")}
          >
            Cijeli period
          </Button>
        </Box>

        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          sx={{ mb: 3 }}
        >
          <Tab label="VAS Postpaid" value="vas_postpaid" />
          <Tab label="Bulk Servisi" value="bulkServisi" />
          <Tab label="VAS Servisi" value="vas_servisi" />
        </Tabs>

        {loading ? (
          <CircularProgress />
        ) : (
          <Grid container spacing={3}>
            {/* Top Providers Section */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, height: "100%" }}>
                <Typography variant="h6" gutterBottom>
                  Top 5 provajdera - {activeTab}
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
                          outerRadius={100}
                          fill="#8884d8"
                          label
                        >
                          {topProviders.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value: number) => [
                            `${value.toLocaleString('sr-RS')} RSD`,
                            "Fakturisani iznos"
                          ]}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <List sx={{ maxHeight: 300, overflow: "auto" }}>
                      {topProviders
                      .sort((a, b) => b.amount - a.amount)
                      .map((provider, index) => (
                        <div key={provider.provider}>
                          <ListItem>
                            <ListItemText
                              primary={`${index + 1}. ${provider.provider}`}
                              secondary={
                                <>
                                  Fakturisano: {(provider.amount || 0).toLocaleString('sr-RS', {
                                  style: 'currency',
                                  currency: 'RSD'
                                })}
                                <br />
                                Transakcije: {provider.count.toLocaleString()}
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

            {/* Top Services Section */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, height: "100%" }}>
                <Typography variant="h6" gutterBottom>
                  Najprodavaniji servisi - {activeTab}
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
                          outerRadius={100}
                          fill="#82ca9d"
                          label
                        >
                          {topServices.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value: number) => [
                            `${value.toLocaleString('sr-RS')} RSD`,
                            "Fakturisani iznos"
                          ]}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <List sx={{ maxHeight: 300, overflow: "auto" }}>
                      {topServices
                      .sort((a, b) => b.amount - a.amount)
                      .map((service, index) => (
                        <div key={service.name}>
                          <ListItem>
                            <ListItemText
                              primary={`${index + 1}. ${service.name}`}
                              secondary={
                                <>
                                  Fakturisano: {service.amount.toLocaleString('sr-RS', {
                                    style: 'currency',
                                    currency: 'RSD'
                                  })}
                                  <br />
                                  Količina: {service.count.toLocaleString()}
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