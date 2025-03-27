import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export async function PATCH() {
  try {
    const session = await getServerSession(authOptions);
    
    // Detaljna provera sesije
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "🔐 Sesija nije validna. Prijavite se ponovo." },
        { status: 401 }
      );
    }

    // Provera korisnika u bazi
    const dbUser = await prisma.user.findUnique({
      where: { id: Number(session.user.id) }
    });

    if (!dbUser) {
      return NextResponse.json(
        { error: "🚨 Korisnik nije pronađen u bazi" },
        { status: 404 }
      );
    }

    // Obrada zahteva...
    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("🚨 Greška u API rutu:", error);
    return NextResponse.json(
      { error: "🔥 Interna serverska greška" },
      { status: 500 }
    );
  }
}
