// app/api/stats/top-services/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const model = searchParams.get("model");
  const month = searchParams.get("month");
  const year = searchParams.get("year");

  if (!model) {
    return NextResponse.json(
      { error: "Missing required parameter: model" },
      { status: 400 }
    );
  }

  try {
    let yearMonth: string | undefined;
    
    if (month && year) {
      const monthNumber = parseInt(month);
      const yearNumber = parseInt(year);
      
      if (isNaN(monthNumber)) {
        return NextResponse.json(
          { error: "Invalid month parameter" },
          { status: 400 }
        );
      }

      if (isNaN(yearNumber)) {
        return NextResponse.json(
          { error: "Invalid year parameter" },
          { status: 400 }
        );
      }

      // Formatiraj u 'YYYY-MM' za string match sa bazom
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
    switch (model) {
      case "vas_postpaid":
        result = await prisma.vas_postpaid.groupBy({
          by: ["Proizvod"],
          where: whereCondition,
          _sum: { 
            Broj_transakcija: true,
            Fakturisan_iznos: true
           },
          orderBy: { _sum: { Broj_transakcija: "desc" } },
          take: 5,
        });
        break;

      case "vas_servisi":
        result = await prisma.vas_servisi.groupBy({
          by: ["naziv_servisa"],
          where: whereCondition,
          _sum: { 
            Broj_transakcija: true,
            Fakturisani_iznos: true // Pretpostavljen naziv polja
          },
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
        return NextResponse.json({ error: "Invalid model" }, { status: 400 });
    }

    const formatted = result.map((item) => ({
      name: item.Proizvod || item.naziv_servisa || item.service_name,
      count: item._sum.Broj_transakcija || item._sum.broj_transakcija || item._sum.message_parts || 0,
      amount: item._sum.Fakturisan_iznos || item._sum.fakturisani_iznos || 0
    }));

    return NextResponse.json(formatted);
  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json(
      { 
        error: "Error fetching data",
        details: error.message 
      },
      { status: 500 }
    );
  }
}
