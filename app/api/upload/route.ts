// app/api/upload/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { writeFile } from "fs/promises";
import path from "path";
import { spawn } from "child_process";
import fs from "fs";

export async function POST(request: Request) {
  try {
    // Provera autentikacije
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Neautorizovan pristup" },
        { status: 401 }
      );
    }

    // Prijem fajla
    const formData = await request.formData();
    const file = formData.get("file") as File;
    
    if (!file) {
      return NextResponse.json(
        { success: false, error: "Nijedan fajl nije pronađen" },
        { status: 400 }
      );
    }

    // Kreiraj upload direktorijum
    const uploadDir = path.join(process.cwd(), "scripts/uploads");
    await fs.promises.mkdir(uploadDir, { recursive: true });

    // Generiši jedinstveno ime fajla
    const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9-_.]/g, "")}`;
    const filePath = path.join(uploadDir, filename);

    // Sačuvaj fajl
    await writeFile(filePath, Buffer.from(await file.arrayBuffer()));

    // Pokreni Python skriptu
    const scriptLogs: string[] = [];
    const scriptProcess = spawn('python3', [
      path.join(process.cwd(), 'scripts/importEmail.py'),
      filePath,
      uploadDir
    ]);

    // Prikupi logove
    scriptProcess.stdout.on('data', (data) => {
      scriptLogs.push(data.toString().trim());
    });

    scriptProcess.stderr.on('data', (data) => {
      scriptLogs.push(`GREŠKA: ${data.toString().trim()}`);
    });

    // Čekaj završetak skripte
    const exitCode = await new Promise((resolve) => {
      scriptProcess.on('close', resolve);
    });

    if (exitCode !== 0) {
      throw new Error(`Skripta završena sa greškom (kod: ${exitCode})`);
    }

    // Proveri rezultate
    const resultPath = path.join(uploadDir, `${path.basename(filePath, path.extname(filePath))}_result.json`);
    if (!fs.existsSync(resultPath)) {
      throw new Error("Nema rezultata obrade");
    }

    const resultData = JSON.parse(fs.readFileSync(resultPath, 'utf-8'));

    return NextResponse.json({
      success: true,
      message: "Fajl uspešno obrađen",
      logs: scriptLogs,
      data: resultData
    });

  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: "Došlo je do greške",
        details: error instanceof Error ? error.message : "Nepoznata greška"
      },
      { status: 500 }
    );
  }
}