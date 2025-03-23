import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { message: "Neophodna je prijava" },
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    const data = await prisma.bulkServisi.findMany({
      orderBy: { provider_name: "asc" },
    });

    if (data === null) {
      console.error('Greška: Data fetched is null');
      return NextResponse.json(
        { message: 'Došlo je do greške pri dohvatanju podataka' },
        { status: 500 }
      );
    }

    // Konvertuj BigInt u string za sve relevantne field-ove
    const transformedData = data.map(item => ({
      ...item,
      id: item.id.toString() // Ovo je ključna promena
    }));

    return NextResponse.json(transformedData, { status: 200 });

  } catch (error) {
    console.error('Greška:', error);
    return NextResponse.json(
      { message: 'Došlo je do greške pri dohvatanju podataka' },
      { status: 500 }
    );
  }
}