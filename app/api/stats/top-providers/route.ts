import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const model = searchParams.get("model");
  const month = searchParams.get("month");
  const year = searchParams.get("year");

  if (!model) {
    return NextResponse.json(
      { error: "Nedostaje parametar: model" },
      { status: 400 }
    );
  }

  try {
    let yearMonth: string | undefined;
    
    if (month && year) {
      const monthNumber = parseInt(month);
      const yearNumber = parseInt(year);
      
      // Ispravljeni uslovi sa zatvorenim zagradama
      if (isNaN(monthNumber)) {
        return NextResponse.json(
          { error: "Nevalidan mjesec" },
          { status: 400 }
        );
      }
      if (isNaN(yearNumber)) {
        return NextResponse.json(
          { error: "Nevalidna godina" },
          { status: 400 }
        );
      }

      yearMonth = `${yearNumber}-${monthNumber.toString().padStart(2, '0')}`;
    }

    let whereCondition = {};
    if (yearMonth) {
      switch(model) {
        case "vas_postpaid":
          whereCondition = {
            Mesec_pruzanja_usluge: {
              startsWith: yearMonth
            }
          };
          break;
        case "vas_servisi":
          whereCondition = {
            date: {
              startsWith: yearMonth
            }
          };
          break;
        case "bulkServisi":
          whereCondition = {
            created_at: {
              startsWith: yearMonth
            }
          };
          break;
      }
    }

    let result;
    switch(model) {
      case "vas_postpaid":
        result = await prisma.vas_postpaid.groupBy({
          by: ["Provajder"],
          where: whereCondition,
          _sum: { Broj_transakcija: true },
          orderBy: { _sum: { Broj_transakcija: "desc" } },
          take: 5
        });
        break;

      case "vas_servisi":
        result = await prisma.vas_servisi.groupBy({
          by: ["naziv_servisa"],
          where: whereCondition,
          _sum: { broj_transakcija: true },
          orderBy: { _sum: { broj_transakcija: "desc" } },
          take: 5,
        });
        break;

      case "bulkServisi":
        result = await prisma.bulkServisi.groupBy({
          by: ["service_name"],
          where: whereCondition,
          _sum: { message_parts: true },
          orderBy: { _sum: { message_parts: "desc" } },
          take: 5,
        });
        break;

      default:
        return NextResponse.json(
          { error: "Nepoznat model" },
          { status: 400 }
        );
    }

    const formatted = result.map((item: any) => ({
      provider: item.Provajder || item.naziv_servisa || item.service_name,
      count: item._sum.Broj_transakcija || 
           item._sum.broj_transakcija || 
           item._sum.message_parts || 0
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Greška u API:", error);
    return NextResponse.json(
      { 
        error: "Interna serverska greška",
        details: error instanceof Error ? error.message : "Nepoznata greška"
      },
      { status: 500 }
    );
  }
}