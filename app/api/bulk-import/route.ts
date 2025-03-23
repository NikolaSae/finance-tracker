import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { message: "Molimo izaberite fajl." },
        { status: 400 }
      );
    }

    // Čuvanje fajla na serveru
    const buffer = Buffer.from(await file.arrayBuffer());
    const filePath = path.join(process.cwd(), "uploads/bulk", file.name);

    // Proverite da li postoji "uploads" folder
    if (!fs.existsSync(path.join(process.cwd(), "uploads/bulk"))) {
      fs.mkdirSync(path.join(process.cwd(), "uploads/bulk"));
    }

    fs.writeFileSync(filePath, buffer);

    return NextResponse.json(
      { message: "Fajl uspešno upload-ovan.", fileName: file.name },
      { status: 200 }
    );
  } catch (error) {
    console.error("Greška prilikom upload-a:", error);
    return NextResponse.json(
      { message: "Došlo je do greške prilikom upload-a." },
      { status: 500 }
    );
  }
}