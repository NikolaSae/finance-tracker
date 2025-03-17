// app/api/export/route.ts
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import writeXlsxFile from 'write-excel-file/node';

const SCHEMAS: { [key: string]: any[] } = {
  transactions: [
    { column: 'ID', value: (row: any) => row.id, width: 15 },
    { column: 'Iznos', value: (row: any) => row.amount, type: Number, format: '#,##0.00' },
    { column: 'Datum', value: (row: any) => new Date(row.date), type: Date, format: 'dd.mm.yyyy' },
    { column: 'Opis', value: (row: any) => row.description, width: 40 }
  ],
  users: [
    { column: 'ID', value: (row: any) => row.id, width: 15 },
    { column: 'Ime', value: (row: any) => row.name, width: 25 },
    { column: 'Email', value: (row: any) => row.email, width: 35 },
    { column: 'Uloga', value: (row: any) => row.role, width: 20 }
  ],
  invoices: [
    { column: 'Broj fakture', value: (row: any) => row.invoice_number, width: 20 },
    { column: 'Datum izdavanja', value: (row: any) => new Date(row.issue_date), type: Date, format: 'dd.mm.yyyy' },
    { column: 'Iznos', value: (row: any) => row.total, type: Number, format: '#,##0.00' },
    { column: 'Status', value: (row: any) => row.status, width: 15 }
  ]
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const list = searchParams.get('list') || 'transactions';

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Niste autorizovani' }, { status: 401 });
    }

    // Provera validnosti liste
    if (!SCHEMAS[list]) {
      return NextResponse.json({ error: 'Nepostojeca lista' }, { status: 400 });
    }

    let query = '';
    const params: any[] = [session.user.id];
    
    switch(list) {
      case 'transactions':
        query = `SELECT * FROM transactions WHERE user_id = $1`;
        break;
      case 'users':
        query = `SELECT * FROM users WHERE created_by = $1`;
        break;
      case 'invoices':
        query = `SELECT * FROM invoices WHERE user_id = $1`;
        break;
    }

    const { rows } = await pool.query(query, params);
    
    const buffer = await writeXlsxFile(rows, {
      schema: SCHEMAS[list],
      headerStyle: {
        fontWeight: 'bold',
        backgroundColor: '#f3f4f6'
      }
    });

    return new NextResponse(buffer, {
      headers: {
        'Content-Disposition': `attachment; filename="${list}.xlsx"`,
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      }
    });

  } catch (error) {
    console.error(`Export error (${list}):`, error);
    return NextResponse.json(
      { error: 'Greska pri generisanju izvestaja' },
      { status: 500 }
    );
  }
}