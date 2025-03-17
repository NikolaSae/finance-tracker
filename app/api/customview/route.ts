// app/api/customview/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { Client } from "pg"; // Assuming you're using PostgreSQL

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  // Check if the user is authenticated
  if (!session) {
    return NextResponse.json({ message: "Access denied" }, { status: 403 });
  }

  const client = new Client({
    user: "postgres",
    host: "localhost",
    database: "newdb",
    password: "postgres",
    port: 5432,
  });

  try {
    await client.connect();

    // Query to get data from the view (e.g., `vas_postpaid_summary`)
    const query = `
      SELECT "Mesec pružanja usluge", "Broj transakcija", "Fakturisan iznos", "Naplaćen iznos"
      FROM vas_postpaid_summary
      WHERE "Mesec pružanja usluge" >= '2024-09-01'
      ORDER BY "Mesec pružanja usluge" DESC
    `;
    const result = await client.query(query);

    // Return the results as JSON
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Error fetching data", error);
    return NextResponse.json({ message: "Error fetching data" }, { status: 500 });
  } finally {
    await client.end();
  }
}
