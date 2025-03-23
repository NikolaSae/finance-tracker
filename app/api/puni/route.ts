import { NextResponse } from "next/server";
import { exec } from "child_process";
import util from "util";

// Promisify exec for cleaner async/await handling
const execPromise = util.promisify(exec);

export async function POST() {
  try {
    // Execute the import script and capture its output
    const { stdout, stderr } = await execPromise(
      "python /workspaces/finance-tracker/scripts/import_script.py"
    );

    if (stderr) {
      console.error(`⚠️ Upozorenje: ${stderr}`);
    }

    // Assuming the Python script outputs a list of processed files or entries
    const updatedFiles = stdout.split("\n").filter(file => file.trim() !== "");

    console.log(`✅ Import uspešan: ${stdout}`);

    return NextResponse.json({
      success: true,
      message: "Import successful",
      updatedFiles, // Send the list of updated files
    });
  } catch (error) {
    console.error(`❌ Greška: ${error.message}`);
    return NextResponse.json({ success: false, message: "Import failed" });
  }
}
