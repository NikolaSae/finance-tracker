import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// GET - Dohvati sve ugovore
export async function GET() {
  try {
    const contracts = await prisma.HumanitarniUgovori.findMany({
      include: {
        user: {
          select: { name: true }, // Učitaj ime korisnika
        },
      },
    });

    return new Response(JSON.stringify(contracts), { status: 200 });
  } catch (error) {
    console.error("Error fetching contracts:", error);
    return new Response(
      JSON.stringify({ message: "Error loading contract data", error: String(error) }),
      { status: 500 }
    );
  }
}

// POST - Kreiraj novi ugovor
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      console.error("Unauthorized");
      return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
    }

    const body = await req.json();
    console.log("Received body:", body);

    if (!body || typeof body !== "object" || Object.keys(body).length === 0) {
      console.error("Invalid request body:", body);
      return new Response(JSON.stringify({ message: "Invalid request body" }), { status: 400 });
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
        userId: session.user.id, // Koristimo ID iz sesije
      },
    });

    return new Response(
      JSON.stringify({ message: "Podaci uspešno zapisani.", contract: newContract }),
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating contract:", error);
    return new Response(
      JSON.stringify({ message: "Error creating contract", error: String(error) }),
      { status: 500 }
    );
  }
}
