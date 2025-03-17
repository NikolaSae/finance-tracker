// backend/analyzeExcelFile.ts
import * as XLSX from 'xlsx';

export async function analyzeExcelFile(filePath: string) {
  try {
    const workbook = XLSX.readFile(filePath);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    console.log("File analyzed successfully", data);
    return data;
  } catch (error) {
    console.error("Error analyzing file:", error);  // Log error details
    throw new Error("Error analyzing the file.");
  }
}

