import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: Request) {
  const session = await getServerSession({
    req: request,
    ...authOptions
  });

  if (!session) {
    return NextResponse.json(
      { error: "🚨 Neovlašten pristup" },
      { status: 401 }
    );
  }

  // Provera uloge
  if (session.user.role !== "admin") {
    return NextResponse.json(
      { error: "⛔ Nedovoljne privilegije" },
      { status: 403 }
    );
  }

  return NextResponse.json({ 
    message: "Dobrodošli admin!", 
    user: session.user 
  });
}