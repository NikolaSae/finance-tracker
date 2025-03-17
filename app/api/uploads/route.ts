import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { email, data } = await request.json();

    const user = await prisma.user.update({
      where: { email },
      data: {
        uploads: {
          create: {
            data: JSON.stringify(data),
            fileName: `Upload-${Date.now()}`
          }
        }
      },
      include: { uploads: true }
    });

    return NextResponse.json({ 
      success: true, 
      uploads: user.uploads 
    });

  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Greška pri čuvanju podataka" },
      { status: 500 }
    );
  }
}