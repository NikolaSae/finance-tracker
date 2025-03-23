// pages/api/excel-analysis.ts
import fs from 'fs';
import path from 'path';
import { analyzeExcelFile } from '../../../hooks/analyzeExcelFile';  // Adjust the path accordingly
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Kreiranje uploads foldera ako ne postoji
    const uploadDir = path.join(process.cwd(), 'uploads');
    const tempFilePath = path.join(uploadDir, file.name);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Putanja fajla

    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Upis fajla
    fs.writeFileSync(tempFilePath, buffer);

    // Analiziranje fajla
    const data = await analyzeExcelFile(tempFilePath);

    return NextResponse.json({ data });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
  }
}
