import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import * as csv from 'csv-parser';
import * as fs from 'fs';
interface CsvRow {
  date: string;
  amount: string;
  category: string;
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const data = await req.formData();
  const file = data.get('file') as File;
  const results: CsvRow[] = [];

  fs.createReadStream(file.path)
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', () => {
      results.forEach(async (row) => {
        await pool.query(
          'INSERT INTO transactions (user_id, date, amount, category) VALUES ($1, $2, $3, $4)',
          [session.user.id, row.date, row.amount, row.category]
        );
      });
    });

  return NextResponse.json({ message: 'Data imported successfully' });
}