'use server';

import { writeFile } from 'fs/promises';
import path from 'path';

export async function saveFile(file: File) {
  try {
    // Validacija tipa fajla
    const ALLOWED_TYPES = [
      'text/plain',
      'application/vnd.ms-outlook',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];

    if (!ALLOWED_TYPES.includes(file.type)) {
      return { success: false, error: 'Nepodržan format fajla' };
    }

    // Konverzija i čuvanje fajla
    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = `${Date.now()}-${file.name}`;
    const uploadPath = path.join(process.cwd(), 'scripts/uploads', filename);
    
    await writeFile(uploadPath, buffer);
    return { success: true, filename };

  } catch (error) {
    console.error('Greška pri čuvanju fajla:', error);
    return { success: false, error: 'Greška pri čuvanju fajla' };
  }
}