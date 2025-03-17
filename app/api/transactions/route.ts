import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('user_id');

  const { rows } = await pool.query('SELECT * FROM transactions WHERE user_id = $1', [userId]);
  return NextResponse.json(rows);
}