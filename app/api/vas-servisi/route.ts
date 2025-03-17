import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const servisi = await prisma.vas_servisi.findMany({
      orderBy: {
        date: 'desc',
      },
    });

    return NextResponse.json(servisi);
  } catch (error) {
    console.error('Greška pri dohvatanju servisa:', error);
    return NextResponse.json({ error: 'Nešto je pošlo po zlu' }, { status: 500 });
  }
}
