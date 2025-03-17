import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const { userId, ...updateData } = await req.json();
    
    // Ажурирање уговора и креирање нове верзије
    const updatedUgovor = await prisma.humanitarniUgovori.update({
      where: { id: Number(params.id) },
      data: {
        ...updateData,
        versions: {
          create: [{
            ...updateData,
            updatedByUserId: userId
          }]
        }
      },
      include: {
        versions: true
      }
    });

    return NextResponse.json(updatedUgovor);

  } catch (error) {
    console.error("Greška pri ažuriranju ugovora:", error);
    return NextResponse.json(
      { error: "Došlo je do greške pri ažuriranju" },
      { status: 500 }
    );
  }
}
export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const ugovor = await prisma.humanitarniUgovori.findUnique({
      where: { id: Number(params.id) },
      include: {
        versions: {
          orderBy: { createdAt: 'desc' },
          include: { updatedBy: true }
        },
        user: true
      }
    });

    if (!ugovor) return NextResponse.json({ error: "Ugovor nije pronađen" }, { status: 404 });

    return NextResponse.json(ugovor);

  } catch (error) {
    console.error("Greška pri dohvatanju ugovora:", error);
    return NextResponse.json(
      { error: "Došlo je do greške" },
      { status: 500 }
    );
  }
}