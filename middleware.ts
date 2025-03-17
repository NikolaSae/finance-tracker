import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  // Ako korisnik nije ulogovan, preusmerite ga na login stranicu
  if (!token) {
    return NextResponse.redirect(new URL('/auth/login', req.url));
  }

  // Ako korisnik pokuša da pristupi /admin rutama, a nije admin
  if (req.nextUrl.pathname.startsWith('/admin') && token.role !== 'admin') {
    return NextResponse.redirect(new URL('/unauthorized', req.url));
  }

  // Ako je sve u redu, nastavite sa zahtevom
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard', // Zaštitite dashboard
    '/reports',   // Zaštitite reports
    '/admin/:path*', // Zaštitite sve rute koje počinju sa /admin
    '/',
    '/vas-postpaid-summary',
  ],
};