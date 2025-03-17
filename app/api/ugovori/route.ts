import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { userId, ...ugovorData } = await req.json();
    
    // Креирање основног уговора
    const noviUgovor = await prisma.humanitarniUgovori.create({
      data: {
        ...ugovorData,
        userId: userId,
        versions: {
          create: [{
            ...ugovorData,
            updatedByUserId: userId
          }]
        }
      },
      include: {
        versions: true
      }
    });

    return NextResponse.json(noviUgovor);

  } catch (error) {
    console.error("Greška pri kreiranju ugovora:", error);
    return NextResponse.json(
      { error: "Došlo je do greške pri čuvanju ugovora" },
      { status: 500 }
    );
  }
}