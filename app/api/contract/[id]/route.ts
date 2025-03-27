// app/api/contract/[id]/route.ts

import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = 'force-dynamic';

const getErrorMessage = (code: string): string => {
  const errors: { [key: string]: string } = {
    P2002: "Duplikat podataka",
    P2025: "Zapis nije pronađen",
    P2003: "Nevažeći relacioni podatak",
    P2022: "Nepostojeća kolona u bazi"
  };
  return errors[code] || "Nepoznata bazna greška";
};

// GET endpoint - ostaje isti
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {

  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return new Response(JSON.stringify({ message: "Neautorizovan pristup" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }

    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return new Response(JSON.stringify({ message: "Nevalidan ID ugovora" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const ugovor = await prisma.HumanitarniUgovori.findUnique({
      where: { id },
      include: { user: { select: { name: true } } }
    });

    if (!ugovor) {
      return new Response(JSON.stringify({ message: "Ugovor nije pronađen" }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }

    return new Response(JSON.stringify(ugovor), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("Greška pri dohvatanju ugovora:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: "Interna serverska greška",
        error: error instanceof Error ? error.message : "Nepoznata greška",
      }),
      { 
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
}

// PUT endpoint sa istorijom promena
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return new Response(JSON.stringify({ message: "Neautorizovan pristup" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }

    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return new Response(JSON.stringify({ message: "Nevalidan ID ugovora" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const rawData = await request.json();
        const { 
  id: _id,
  userId: _userId, 
  user: _user, 
  ...cleanData 
} = rawData;

    // 1. Osnovna validacija obaveznih polja
    const requiredFields = ['humanitarnaOrganizacija', 'ugovor', 'datumPocetka', 'datumIstekka'];
    const missingFields = requiredFields.filter(field => !cleanData[field]);
    if (missingFields.length > 0) {
      return new Response(JSON.stringify({
        message: `Obavezna polja: ${missingFields.join(', ')}`
      }), { status: 400 });
    }

    // 2. Validacija formata podataka
    const formatErrors: string[] = [];
    
    // Telefon (optional)
    if (cleanData.telefon && !/^\+?\d{6,15}$/.test(cleanData.telefon)) {
      formatErrors.push("Telefon mora sadržati 6-15 cifara");
    }

    // Email (optional)
    if (cleanData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanData.email)) {
      formatErrors.push("Nevalidan email format");
    }

    // PIB (optional)
    if (cleanData.pib && !/^\d{9}$/.test(cleanData.pib)) {
      formatErrors.push("PIB mora imati tačno 9 cifara");
    }

    // MB (optional)
    if (cleanData.mb && !/^\d{8}$/.test(cleanData.mb)) {
      formatErrors.push("MB mora imati tačno 8 cifara");
    }

    if (formatErrors.length > 0) {
      return new Response(JSON.stringify({
        message: `Greške u formatu: ${formatErrors.join(', ')}`
      }), { status: 400 });
    }

    // 3. Validacija datuma
    const datumPocetka = new Date(cleanData.datumPocetka);
    const datumIstekka = new Date(cleanData.datumIstekka);
    if (datumPocetka >= datumIstekka) {
      return new Response(JSON.stringify({
        message: "Datum isteka mora biti posle datuma početka"
      }), { status: 400 });
    }

    // 4. Provera jedinstvenosti kratkog broja
    if (cleanData.kratkiBroj) {
      const existing = await prisma.HumanitarniUgovori.findFirst({
        where: {
          kratkiBroj: cleanData.kratkiBroj,
          NOT: { id: id }
        }
      });
      if (existing) {
        return new Response(JSON.stringify({
          message: "Kratki broj već postoji"
        }), { status: 400 });
      }
    }

    // 5. Provera postojanja korisnika (ako se šalju)
    if (cleanData.userId) {
      const userExists = await prisma.users.findUnique({
        where: { id: cleanData.userId }
      });
      if (!userExists) {
        return new Response(JSON.stringify({
          message: "Korisnik ne postoji"
        }), { status: 404 });
      }
    }

    // 6. Max dužine za varchar polja
    const lengthErrors: string[] = [];
    const maxLengths = {
      humanitarnaOrganizacija: 255,
      ugovor: 255,
      kratkiBroj: 20,
      telefon: 20,
      email: 255,
      pib: 20,
      racun: 50,
      banka: 100,
      mb: 20
    };

    Object.entries(maxLengths).forEach(([field, max]) => {
      if (cleanData[field] && cleanData[field].length > max) {
        lengthErrors.push(`${field} premašuje maksimalnu dužinu (${max})`);
      }
    });

    if (lengthErrors.length > 0) {
      return new Response(JSON.stringify({
        message: `Prekoračene dužine polja: ${lengthErrors.join(', ')}`
      }), { status: 400 });
    }

    // Ako sve validacije prođu, izvrši ažuriranje
    const result = await prisma.$transaction(async (tx) => {
      const existingContract = await tx.HumanitarniUgovori.findUnique({
        where: { id },
      });

      if (!existingContract) {
        throw new Error("Ugovor nije pronađen");
      }

      // Kreiraj istorijski zapis PRE ažuriranja
      await tx.HumanitarniUgovoriHistory.create({
        data: {
          originalId: existingContract.id,
          operationType: 'UPDATE',
          datumPromene: new Date(),
          updatedBy: { connect: { id: parseInt(session.user.id, 10) } },
          
          // Postavi stare vrednosti
          humanitarnaOrganizacija_old: existingContract.humanitarnaOrganizacija,
          ugovor_old: existingContract.ugovor,
          datumPocetka_old: existingContract.datumPocetka,
          datumIstekka_old: existingContract.datumIstekka,
          kratkiBroj_old: existingContract.kratkiBroj,
          telefon_old: existingContract.telefon,
          email_old: existingContract.email,
          pib_old: existingContract.pib,
          racun_old: existingContract.racun,
          banka_old: existingContract.banka,
          mb_old: existingContract.mb,
          aneks_1_old: existingContract.aneks_1,
          aneks_2_old: existingContract.aneks_2,
          aneks_3_old: existingContract.aneks_3,
          aneks_4_old: existingContract.aneks_4,
          aneks_5_old: existingContract.aneks_5,
          aneks_6_old: existingContract.aneks_6,
          
          // Postavi nove vrednosti
          humanitarnaOrganizacija_new: cleanData.humanitarnaOrganizacija,
          ugovor_new: cleanData.ugovor,
          datumPocetka_new: cleanData.datumPocetka,
          datumIstekka_new: cleanData.datumIstekka,
          kratkiBroj_new: cleanData.kratkiBroj,
          telefon_new: cleanData.telefon,
          email_new: cleanData.email,
          pib_new: cleanData.pib,
          racun_new: cleanData.racun,
          banka_new: cleanData.banka,
          mb_new: cleanData.mb,
          aneks_1_new: cleanData.aneks_1,
          aneks_2_new: cleanData.aneks_2,
          aneks_3_new: cleanData.aneks_3,
          aneks_4_new: cleanData.aneks_4,
          aneks_5_new: cleanData.aneks_5,
          aneks_6_new: cleanData.aneks_6,
        }
      });

      // Ažuriraj glavni ugovor
      const updatedContract = await tx.HumanitarniUgovori.update({
        where: { id },
        data: {
          ...cleanData,
          updatedUserId: parseInt(session.user.id, 10),
        },
      });

      return updatedContract;
    });

    return new Response(
      JSON.stringify({ success: true, data: result }),
      { status: 200 }
    );

  } catch (error) {
    console.error("Greška:", error);
    
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return new Response(
        JSON.stringify({
          success: false,
          errorCode: error.code,
          message: getErrorMessage(error.code),
          meta: error.meta
        }),
        { status: 500 }
      );
    }
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: error instanceof Error ? error.message : "Interna greška"
      }),
      { status: 500 }
    );
  }
}
