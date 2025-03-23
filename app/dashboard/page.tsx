"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Box, Typography, CircularProgress, Link as MuiLink } from "@mui/material";
import Layout from "../layout"; // Ispravljena putanja
import Link from "next/link";
import { useTheme } from "next-themes";

interface Ugovor {
  id: number;
  humanitarnaOrganizacija: string;
  kratkiBroj?: string;
}

interface StatsData {
  humanitarni: number;
  postpaid: number;
  servisi: number;
  ugovori: Ugovor[];
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const fetchData = async () => {
      if (!session?.user?.email) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`/api/users/${encodeURIComponent(session.user.email)}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        setStats({
          humanitarni: data.HumanitarniUgovori?.length || 0,
          postpaid: data.vas_postpaid?.length || 0,
          servisi: data.vas_servisi?.length || 0,
          ugovori: data.HumanitarniUgovori || []
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
        setError("Došlo je do greške pri učitavanju podataka. Pokušajte ponovo kasnije.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [session]);

  if (status === "loading") {
    return (
      <Layout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  if (!session?.user) {
    return (
      <Layout>
        <Typography variant="body1" align="center" py={4}>
          Prijavite se da biste videli statistiku
        </Typography>
      </Layout>
    );
  }

  return (
    <Layout>
      <Box minHeight="100vh" p={4} bgcolor="background.default">
        <Box maxWidth="4xl" mx="auto">
          <Typography variant="h4" fontWeight="bold" mb={4} textAlign="center">
            {session.user.name || session.user.email}
          </Typography>

          {error && (
            <Box mb={4} p={2} bgcolor="error.light" color="error.main" borderRadius={2}>
              <Typography>{error}</Typography>
            </Box>
          )}

          {loading ? (
            <Box textAlign="center" py={4}>
              <CircularProgress />
              <Typography mt={2} color="text.secondary">
                Učitavanje podataka...
              </Typography>
            </Box>
          ) : (
            <>
              <Box display="grid" gridTemplateColumns={{ xs: "1fr", md: "repeat(3, 1fr)" }} gap={4} mb={4}>
                <StatCard title="Humanitarni ugovori" value={stats?.humanitarni || 0} />
                <StatCard title="VAS Postpaid" value={stats?.postpaid || 0} />
                <StatCard title="VAS Servisi" value={stats?.servisi || 0} />
              </Box>

              <Box bgcolor="background.paper" p={4} borderRadius={2} boxShadow={3}>
                <Typography variant="h6" fontWeight="semibold" mb={2}>
                  Aktivni humanitarni ugovori
                </Typography>
                
                {stats?.ugovori?.length ? (
                  <Box>
                    {stats.ugovori.map((ugovor) => (
                      <ContractListItem
                        key={ugovor.id}
                        id={ugovor.id}
                        organization={ugovor.humanitarnaOrganizacija}
                        contractNumber={ugovor.kratkiBroj}
                      />
                    ))}
                  </Box>
                ) : (
                  <EmptyState message="Nema aktivnih humanitarnih ugovora" />
                )}
              </Box>
            </>
          )}
        </Box>
      </Box>
    </Layout>
  );
}

function StatCard({ title, value }: { title: string; value: number }) {
  return (
    <Box bgcolor="background.paper" p={3} borderRadius={2} boxShadow={3} textAlign="center">
      <Typography variant="h6" color="text.secondary" mb={1}>
        {title}
      </Typography>
      <Typography variant="h4" color="primary.main" fontWeight="bold">
        {value.toLocaleString()}
      </Typography>
    </Box>
  );
}

function ContractListItem({
  id,
  organization,
  contractNumber,
}: {
  id: number;
  organization: string;
  contractNumber?: string;
}) {
  return (
    <Link href={`/ugovori/${id}`} passHref>
      <MuiLink component="div" p={2} borderRadius={1} sx={{ "&:hover": { bgcolor: "action.hover" } }}>
        <Typography fontWeight="medium">{organization}</Typography>
        <Typography variant="body2" color="text.secondary">
          Broj ugovora: {contractNumber || "N/A"}
        </Typography>
      </MuiLink>
    </Link>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <Box textAlign="center" py={3}>
      <Typography variant="body2" color="text.secondary">
        {message}
      </Typography>
    </Box>
  );
}