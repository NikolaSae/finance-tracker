// app/api/readExcel/route.ts
import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';

export async function GET() {
  // Putanja do Excel fajla na serveru (može biti u public direktorijumu ili bilo gde na serveru)
  const filePath = path.join(process.cwd(), 'your-file.xlsx');  // Zameni sa stvarnom putanjom

  // Čitanje Excel fajla
  const workbook = XLSX.readFile(filePath);
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];  // Uzmi prvi sheet

  // Čitanje svih ćelija i stilova
  const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:A1');
  const cellData: any[] = [];

  for (let row = range.s.r; row <= range.e.r; row++) {
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cellAddress = { r: row, c: col };
      const cell = worksheet[XLSX.utils.encode_cell(cellAddress)];

      if (cell) {
        const cellInfo: any = {
          address: XLSX.utils.encode_cell(cellAddress),
          value: cell.v,
          style: cell.s || null,
        };

        // Izdvajanje stila (ako postoji)
        if (cell.s) {
          cellInfo.font = cell.s.font;
          cellInfo.fill = cell.s.fill;
          cellInfo.alignment = cell.s.alignment;
        }

        cellData.push(cellInfo);
      }
    }
  }

  // Vraćanje podataka kao JSON odgovor
  return NextResponse.json({ data: cellData });
}
