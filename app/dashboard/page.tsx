"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Layout from "@/components/Layout";
import Link from 'next/link';

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
        <div className="flex justify-center items-center min-h-screen">
          <div 
            className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"
            aria-label="Učitavanje sesije"
          />
        </div>
      </Layout>
    );
  }

  if (!session?.user) {
    return (
      <Layout>
        <p className="text-center py-8">Prijavite se da biste videli statistiku</p>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-8 text-center">
            {session.user.name || session.user.email}
          </h1>

          {error && (
            <div className="mb-8 p-4 bg-red-100 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {loading ? (
            <div className="text-center py-8">
              <div 
                className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent mx-auto"
                aria-label="Učitavanje podataka"
              />
              <p className="mt-4 text-gray-600">Učitavanje podataka...</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <StatCard 
                  title="Humanitarni ugovori"
                  value={stats?.humanitarni || 0}
                />
                <StatCard
                  title="VAS Postpaid"
                  value={stats?.postpaid || 0}
                />
                <StatCard
                  title="VAS Servisi"
                  value={stats?.servisi || 0}
                />
              </div>

              <div className="bg-white p-6 rounded-xl shadow-lg">
                <h2 className="text-xl font-semibold mb-4">
                  Aktivni humanitarni ugovori
                </h2>
                
                {stats?.ugovori?.length ? (
                  <div className="divide-y">
                    {stats.ugovori.map((ugovor) => (
                      <ContractListItem
                        key={ugovor.id}
                        id={ugovor.id}
                        organization={ugovor.humanitarnaOrganizacija}
                        contractNumber={ugovor.kratkiBroj}
                      />
                    ))}
                  </div>
                ) : (
                  <EmptyState message="Nema aktivnih humanitarnih ugovora" />
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}

function StatCard({ title, value }: { title: string; value: number }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg text-center hover:shadow-xl transition-shadow">
      <h3 className="text-lg font-semibold mb-2 text-gray-700">{title}</h3>
      <div className="text-3xl font-bold text-blue-600">
        {value.toLocaleString()}
      </div>
    </div>
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
    <Link
      href={`/ugovori/${id}`}
      className="block p-4 hover:bg-gray-50 transition-colors"
      aria-label={`Pregledaj ugovor sa ${organization}`}
    >
      <div className="font-medium text-gray-900">{organization}</div>
      <div className="text-sm text-gray-600">
        Broj ugovora: {contractNumber || 'N/A'}
      </div>
    </Link>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-center py-6">
      <div className="text-gray-400 mb-2">⎯</div>
      <p className="text-gray-500">{message}</p>
    </div>
  );
}