import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// GET - Fetch all contracts
export async function GET() {
  try {
    const contracts = await prisma.HumanitarniUgovori.findMany({
      include: {
        user: {
          select: { name: true },
        },
      },
    });

    // Log the fetched contracts
    console.log("Fetched contracts:", contracts);

    return NextResponse.json(contracts, { status: 200 });
  } catch (error) {
    console.error("Error fetching contracts:", error);
    return NextResponse.json(
      { message: "Error loading contract data", error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// POST - Create a new contract
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      console.error("Unauthorized access attempt");
      return NextResponse.json({ 
        message: "Permission denied: Please log in" 
      }, { status: 401 });
    }

    // Temp permit all authenticated users during testing
    console.log('User role:', session.user.role);

    const body = await req.json();
    console.log("Received body:", body);

    if (!body || typeof body !== "object" || Object.keys(body).length === 0) {
      console.error("Invalid request body:", body);
      return NextResponse.json({ message: "Invalid request body" }, { status: 400 });
    }

    const newContract = await prisma.HumanitarniUgovori.create({
      data: {
        humanitarnaOrganizacija: body.humanitarnaOrganizacija,
        ugovor: body.ugovor,
        datumPocetka: body.datumPocetka ? new Date(body.datumPocetka) : null,
        datumIstekka: body.datumIstekka ? new Date(body.datumIstekka) : null,
        kratkiBroj: body.kratkiBroj || null,
        telefon: body.telefon || null,
        email: body.email || null,
        pib: body.pib || null,
        racun: body.racun || null,
        banka: body.banka || null,
        mb: body.mb || null,
        userId: session.user.id,
      },
    });

    // Log the newly created contract
    console.log("New contract created:", newContract);

    return NextResponse.json(
      { message: "Data successfully saved.", contract: newContract },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating contract:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Error creating contract:', errorMessage);
    return NextResponse.json(
      { message: "Error creating contract", error: errorMessage },
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
