"use client";
import { useEffect, useState } from 'react';

export default function UgovorPrikaz({ ugovorId }: { ugovorId: number }) {
  const [ugovor, setUgovor] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUgovor = async () => {
      try {
        const res = await fetch(`/api/ugovori/${ugovorId}`);
        const data = await res.json();
        setUgovor(data);
      } catch (error) {
        console.error("Greška:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUgovor();
  }, [ugovorId]);

  if (loading) return <div>Učitavanje...</div>;
  if (!ugovor) return <div>Ugovor nije pronađen</div>;

  return (
    <div className="space-y-6">
      {/* Основне информације */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4">{ugovor.humanitarnaOrganizacija}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-500">Broj ugovora</label>
            <p className="mt-1">{ugovor.kratkiBroj}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">Period važenja</label>
            <p className="mt-1">
              {new Date(ugovor.datumPocetka).toLocaleDateString()} - {new Date(ugovor.datumIstekka).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Историја измена */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-xl font-semibold mb-4">Istorija izmena</h3>
        {ugovor.versions.map((version: any) => (
          <div key={version.id} className="border-l-4 border-blue-500 pl-4 mb-4">
            <div className="text-sm text-gray-500 mb-2">
              Izmena: {new Date(version.createdAt).toLocaleDateString()}
              {version.updatedBy && ` (${version.updatedBy.name})`}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="font-medium">Organizacija:</span> {version.humanitarnaOrganizacija}
              </div>
              <div>
                <span className="font-medium">Datum isteka:</span> {new Date(version.datumIstekka).toLocaleDateString()}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}