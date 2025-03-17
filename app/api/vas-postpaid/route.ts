// app/api/vas-postpaid/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {

  try {
    const { searchParams } = new URL(request.url);
    
    // Фиљтери
    const Proizvod = searchParams.get('Proizvod');
    const Mesec_pruzanja_usluge = searchParams.get('Mesec_pruzanja_usluge');
    const Provajder = searchParams.get('Provajder');

    const whereClause = {
      ...(Proizvod && { Proizvod: Proizvod }),
      ...(Mesec_pruzanja_usluge && { "Mesec_pruzanja_usluge": Mesec_pruzanja_usluge }),
      ...(Provajder && { Provajder: Provajder })
    };
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');
    const data = await prisma.vas_postpaid.findMany({
      where: whereClause,
      orderBy: {
        Proizvod: 'desc'
      }
    });

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: "Нема података за приказ" },
        { status: 404 }
      );
    }

    return NextResponse.json(data, {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET'
      }
    });

  } catch (error) {
    console.error('Грешка при преузимању података:', error);
    return NextResponse.json(
      { error: "Дошло је до грешке на серверу" },
      { status: 500 }
    );
  }
}