import { exec } from "child_process";
import { NextResponse } from "next/server";

export async function POST() {
  return new Promise((resolve) => {
    exec(
      'python /workspaces/finance-tracker/scripts/skripta.py',
      (error, stdout, stderr) => {
        if (error) {
          console.error("❌ Import error:", stderr);
          resolve(
            NextResponse.json(
              {
                message: "Import failed",
                logs: stderr.split("\n"),
              },
              { status: 500 }
            )
          );
          return;
        }
        const logs = stdout.split("\n").filter(Boolean);
        resolve(
          NextResponse.json(
            {
              message: "Import successful",
              logs: logs,
            },
            { status: 200 }
          )
        );
      }
    );
  });
}
