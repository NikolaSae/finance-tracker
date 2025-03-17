import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // Проверите да ли је овај импорт тачан
export async function GET(
  request: Request,
  { params }: { params: { email: string } }
) {
  try {
    const user = await prisma.users.findUnique({
      where: { email: decodeURIComponent(params.email) },
      include: {
        HumanitarniUgovori: true,
        vas_postpaid: true,
        vas_servisi: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: "Корисник није пронађен" },
        { status: 404 }
      );
    }


    // Прикријемо лозинку у одговору
    const userWithoutPassword = { ...user, password: undefined };
    
    return NextResponse.json(userWithoutPassword);

  } catch (error) {
    console.error("Грешка при дохватању података:", error);
    return NextResponse.json(
      { error: "Серверска грешка" },
      { status: 500 }
    );
  }
}