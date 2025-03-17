"use client";
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import AgGridWrapper from '@/components/AgGridWrapper';

interface VasPostpaidData {
  id: number;
  Proizvod: string;
  Mesec_pruzanja_usluge: string;
  Jedinicna_cena: number;
  Broj_transakcija: number;
  Fakturisan_iznos: number;
  Fakturisan_korigovan_iznos: number;
  Naplacen_iznos: number;
  Kumulativ_naplacenih_iznosa: number;
  Nenaplacen_iznos: number;
  Nenaplacen_korigovan_iznos: number;
  Storniran_iznos_u_tekucem_mesecu_iz_perioda_pracenja: number;
  Otkazan_iznos: number;
  Kumulativ_otkazanih_iznosa: number;
  Iznos_za_prenos_sredstava_: number;
  Provajder?: string;
}

export default function VasPostpaidPage() {
  const { data: session } = useSession();
  const [data, setData] = useState<VasPostpaidData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    Proizvod: '',
    Mesec_pruzanja_usluge: '',
    Provajder: ''
  });

  // Fetch data from the API
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams(filters);
      const res = await fetch(`/api/vas-postpaid?${params}`);
      
      if (!res.ok) throw new Error('Greška pri učitavanju');
      
      const result = await res.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nepoznata greška');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user) fetchData();
  }, [session, filters]);

  // Transform "Month Year" to valid Date (e.g., "October 2023" → "2023-10-01")
  const transformedData = data.map(item => {
    const [month, year] = item.Mesec_pruzanja_usluge.split(' ');
    const monthIndex = new Date(`${month} 1, ${year}`).getMonth() + 1;
    const formattedDate = `${year}-${monthIndex.toString().padStart(2, '0')}-01`;
    return {
      ...item,
      Mesec_pruzanja_usluge: formattedDate // Now in "YYYY-MM-DD" format
    };
  });

  // Column definitions
  const columnDefs = [
    { 
      field: "Mesec_pruzanja_usluge", 
      headerName: "Mesec",
      cellDataType: 'date', // Explicitly declare as date
      valueFormatter: ({ value }: { value: string }) => {
        const date = new Date(value);
        return date.toLocaleDateString('sr-Latn-RS', {
          year: 'numeric',
          month: 'long'
        });
      },
      filter: 'agDateColumnFilter',
      filterParams: {
        comparator: (filterDate: Date, cellValue: string) => {
          const cellDate = new Date(cellValue);
          return cellDate.getTime() - filterDate.getTime();
        }
      },
      enableRowGroup: true
    },
    { 
      field: "Proizvod", 
      headerName: "Proizvod", 
      filter: 'agSetColumnFilter',
      enableRowGroup: true
    },
    { 
      field: "Jedinicna_cena",
      headerName: "Jed. Cena",
      valueFormatter: ({ value }: { value: number }) => 
        new Intl.NumberFormat('sr-RS', {
          style: 'currency',
          currency: 'RSD'
        }).format(value)
    },
    { field: "Broj_transakcija", headerName: "Transakcije" },
    { 
      field: "Fakturisan_iznos",
      headerName: "Fakturisano",
      valueFormatter: ({ value }: { value: number }) => 
        new Intl.NumberFormat('sr-RS', {
          style: 'currency',
          currency: 'RSD'
        }).format(value)
    },
    { field: "Provajder", headerName: "Provajder" }
  ];

  if (!session?.user) {
    return <div className="text-center py-8 text-lg">Molimo prijavite se za pristup</div>;
  }

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">VAS Postpaid Analiza</h1>
      
      {/* Filter Controls */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <input
          type="text"
          placeholder="Proizvod..."
          className="p-2 border rounded"
          value={filters.Proizvod}
          onChange={e => setFilters({...filters, Proizvod: e.target.value})}
        />
        <input
          type="month"
          className="p-2 border rounded"
          value={filters.Mesec_pruzanja_usluge}
          onChange={e => setFilters({...filters, Mesec_pruzanja_usluge: e.target.value})}
        />
        <input
          type="text"
          placeholder="Provajder..."
          className="p-2 border rounded"
          value={filters.Provajder}
          onChange={e => setFilters({...filters, Provajder: e.target.value})}
        />
      </div>

      {/* Loading & Error States */}
      {loading && <div className="text-center py-4">Učitavam podatke...</div>}
      {error && <div className="text-center text-red-500 py-4">{error}</div>}

      {/* AG Grid Table */}
      {!loading && !error && (
        <AgGridWrapper<VasPostpaidData>
          rowData={transformedData}
          columnDefs={columnDefs}
        />
      )}
    </div>
  );
}