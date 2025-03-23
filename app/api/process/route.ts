import { NextResponse } from "next/server";
import { exec } from "child_process";
import path from "path";

export async function POST(request: Request) {
  try {
    const { fileName } = await request.json();

    if (!fileName) {
      return NextResponse.json(
        { message: "Nije pronađen fajl za obradu." },
        { status: 400 }
      );
    }

    // Putanja do upload-ovanog fajla
    const filePath = path.join(process.cwd(), "uploads/bulk", fileName);
    console.log("Putanja do CSV fajla:", filePath);

    // Putanja do Python skripte
    const scriptPath = path.join(process.cwd(), "data", "bulk-skripta.py");
    console.log("Putanja do Python skripte:", scriptPath);

    // Komanda za pokretanje skripte
    const command = `python3 ${scriptPath} ${filePath}`;
    console.log("Komanda za pokretanje skripte:", command);

    // Omotajte exec u Promise
    const execPromise = new Promise((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
        if (error) {
          console.error("Greška prilikom pokretanja skripte:", error);
          console.error("Stderr:", stderr);
          reject(new Error("Došlo je do greške prilikom obrade."));
        } else {
          console.log("Skripta uspešno pokrenuta. Output:", stdout);
          resolve(stdout);
        }
      });
    });

    // Sačekajte da se exec završi
    const output = await execPromise;

    // Vratite uspešan odgovor
    return NextResponse.json(
      { message: "Uspešno obrađeni podaci.", output },
      { status: 200 }
    );
  } catch (error) {
    console.error("Greška prilikom obrade:", error);
    return NextResponse.json(
      { message: "Došlo je do greške prilikom obrade." },
      { status: 500 }
    );
  }
}