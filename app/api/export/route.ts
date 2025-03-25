import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import writeXlsxFile from 'write-excel-file/node';

// Define interfaces for different row types
interface TransactionRow {
  id: number;
  amount: number;
  date: string;
  description: string;
  user_id: number;
}

interface UserRow {
  id: number;
  name: string;
  email: string;
  role: string;
  created_by: number;
}

interface InvoiceRow {
  invoice_number: string;
  issue_date: string;
  total: number;
  status: string;
  user_id: number;
}

// Define schema type
interface SchemaDefinition<T> {
  column: string;
  value: (row: T) => string | number | Date;
  width?: number;
  type?: typeof Number | typeof Date;
  format?: string;
}

interface Schema {
  [key: string]: SchemaDefinition<TransactionRow | UserRow | InvoiceRow>[];
}

const SCHEMAS: Schema = {
  transactions: [
    { column: 'ID', value: (row: TransactionRow) => row.id, width: 15 },
    { column: 'Iznos', value: (row: TransactionRow) => row.amount, type: Number, format: '#,##0.00' },
    { column: 'Datum', value: (row: TransactionRow) => new Date(row.date), type: Date, format: 'dd.mm.yyyy' },
    { column: 'Opis', value: (row: TransactionRow) => row.description, width: 40 }
  ],
  users: [
    { column: 'ID', value: (row: UserRow) => row.id, width: 15 },
    { column: 'Ime', value: (row: UserRow) => row.name, width: 25 },
    { column: 'Email', value: (row: UserRow) => row.email, width: 35 },
    { column: 'Uloga', value: (row: UserRow) => row.role, width: 20 }
  ],
  invoices: [
    { column: 'Broj fakture', value: (row: InvoiceRow) => row.invoice_number, width: 20 },
    { column: 'Datum izdavanja', value: (row: InvoiceRow) => new Date(row.issue_date), type: Date, format: 'dd.mm.yyyy' },
    { column: 'Iznos', value: (row: InvoiceRow) => row.total, type: Number, format: '#,##0.00' },
    { column: 'Status', value: (row: InvoiceRow) => row.status, width: 15 }
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

    if (!SCHEMAS[list]) {
      return NextResponse.json({ error: 'Nepostojeca lista' }, { status: 400 });
    }

    let query = '';
    const params: string[] = [session.user.id];
    
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

    const { rows } = await pool.query<TransactionRow | UserRow | InvoiceRow>(query, params);
    
    const buffer = await writeXlsxFile(rows as (TransactionRow | UserRow | InvoiceRow)[], {
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