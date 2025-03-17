import { PrismaClient } from "@prisma/client";

let prisma: PrismaClient;

if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient();
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }
  prisma = global.prisma;
}

export async function GET() {
  try {
    const contracts = await prisma.humanitarniUgovori.findMany();
    return new Response(JSON.stringify(contracts), { status: 200 });
  } catch (error) {
    console.error("Error fetching contracts:", error);
    return new Response(JSON.stringify({ message: "Error loading contract data" }), { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("Received body:", body); // Proveri šta tačno dolazi

    if (!body || typeof body !== "object" || Object.keys(body).length === 0) {
      console.error("Invalid request body:", body);
      return new Response(JSON.stringify({ message: "Invalid request body" }), { status: 400 });
    }

    const newContract = await prisma.humanitarniUgovori.create({
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
      },
    });

    return new Response(JSON.stringify({ message: "Podaci uspešno zapisani.", contract: newContract }), {
      status: 201,
    });
  } catch (error) {
    console.error("Error creating contract:", error);
    return new Response(JSON.stringify({ message: "Error creating contract", error: String(error) }), {
      status: 500,
    });
  }
}
