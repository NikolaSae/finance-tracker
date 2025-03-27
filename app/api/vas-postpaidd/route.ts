// app/api/vas-postpaidd/route.ts
import { NextResponse } from 'next/server';

type VasPostpaidTable = {
  id: number;
  Proizvod: string;
  Mesec_pruzanja_usluge: string;
  Jedinicna_cena: number;
  Broj_transakcija: number;
  Fakturisan_iznos: number;
  Provajder?: string;
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get('page')) || 1;
  const pageSize = Number(searchParams.get('pageSize')) || 20;

  const externalApiUrl = `https:localhost/api/vas-postpaidd?page=${page}&pageSize=${pageSize}`;

  try {
    const externalRes = await fetch(externalApiUrl);
    if (!externalRes.ok) {
      throw new Error(`Error fetching data: ${externalRes.status}`);
    }
    const externalData = await externalRes.json();

    // Validate and transform the external data as needed
    const validatedData: VasPostpaidTable[] = externalData.data.map((item) => ({
      id: item.id,
      Proizvod: item.Proizvod,
      Mesec_pruzanja_usluge: item.Mesec_pruzanja_usluge,
      Jedinicna_cena: Number(item.Jedinicna_cena),
      Broj_transakcija: Number(item.Broj_transakcija),
      Fakturisan_iznos: Number(item.Fakturisan_iznos),
      Provajder: item.Provajder,
    }));

    const total = externalData.meta.total;
    const totalPages = Math.ceil(total / pageSize);

    return NextResponse.json({
      data: validatedData,
      meta: {
        total,
        page,
        pageSize,
        totalPages,
      },
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { message: 'Failed to fetch data' },
      { status: 500 }
    );
  }
}
