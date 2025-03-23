// app/api/contract/history/route.ts

import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = 'force-dynamic';

// Definisanje tipova
type TrackedField = 
  | 'humanitarnaOrganizacija'
  | 'ugovor'
  | 'datumPocetka'
  | 'datumIstekka'
  | 'kratkiBroj'
  | 'telefon'
  | 'email'
  | 'pib'
  | 'racun'
  | 'banka'
  | 'mb'
  | 'aneks_1';

type HistoryEntry = Prisma.HumanitarniUgovoriHistoryGetPayload<{
  include: {
    author: { select: { name: true } },
    updatedBy: { select: { name: true } }
  }
}>;

interface FieldChange {
  old: string | null;
  new: string | null;
}

interface ProcessedHistoryEntry {
  id: number;
  originalId: number;
  operationType: string;
  datumPromene: string;
  korisnik: string;
  humanitarnaOrganizacija: string;
  kratkiBroj: string;
  ugovor: string;
  promene: Record<string, FieldChange> | null;
  style: string;
}

// Funkcija za generisanje poruke o grešci
const getErrorMessage = (code: string): string => {
  const errors: Record<string, string> = {
    P2002: "Duplikat podataka",
    P2025: "Zapis nije pronađen",
    P2003: "Nevažeći relacioni podatak",
    P2022: "Nepostojeća kolona u bazi",
  };
  return errors[code] || "Nepoznata bazna greška";
};

// Funkcija za formatiranje vrednosti
const formatValue = (value: unknown): string | null => {
  if (value instanceof Date) return value.toISOString();
  if (value === null || value === undefined) return null;
  if (typeof value === 'string') return value.trim() || null;
  return String(value);
};

// Funkcija za obradu jednog unosa iz baze
const processEntry = (entry: HistoryEntry): ProcessedHistoryEntry => {
  const trackedFields: TrackedField[] = [
    "humanitarnaOrganizacija",
    "ugovor",
    "datumPocetka",
    "datumIstekka",
    "kratkiBroj",
    "telefon",
    "email",
    "pib",
    "racun",
    "banka",
    "mb",
    "aneks_1",
  ];

  const changes: Record<string, FieldChange> = {};

  trackedFields.forEach((field) => {
    const oldValue = entry[`${field}_old` as keyof HistoryEntry];
    const newValue = entry[`${field}_new` as keyof HistoryEntry];

    const formattedOld = formatValue(oldValue);
    const formattedNew = formatValue(newValue);

    if (formattedOld !== formattedNew) {
      changes[field] = {
        old: formattedOld,
        new: formattedNew,
      };
    }
  });

  const rowBackground = Object.keys(changes).length > 0 
    ? "background-color: yellow !important;" 
    : "background-color: white !important;";

  return {
    id: entry.id,
    originalId: entry.originalId,
    operationType: entry.operationType,
    datumPromene: entry.datumPromene.toISOString(),
    korisnik: entry.updatedBy?.name || entry.author?.name || "Nepoznat korisnik",
    humanitarnaOrganizacija: formatValue(entry.humanitarnaOrganizacija_new) ?? formatValue(entry.humanitarnaOrganizacija_old) ?? "N/A",
    kratkiBroj: formatValue(entry.kratkiBroj_new) ?? formatValue(entry.kratkiBroj_old) ?? "N/A",
    ugovor: formatValue(entry.ugovor_new) ?? formatValue(entry.ugovor_old) ?? "N/A",
    promene: Object.keys(changes).length > 0 ? changes : null,
    style: rowBackground,
  };
};

// Glavna GET funkcija (ostaje ista)
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return new Response(JSON.stringify({ message: "Neautorizovan pristup" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { searchParams } = new URL(req.url);
    const originalId = searchParams.get("originalId");

    if (!originalId) {
      return new Response(JSON.stringify({ message: "Missing originalId parameter" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const id = parseInt(originalId, 10);
    if (isNaN(id)) {
      return new Response(JSON.stringify({ message: "Nevalidan originalId" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const historyEntries = await prisma.HumanitarniUgovoriHistory.findMany({
      where: { originalId: id },
      orderBy: { datumPromene: "desc" },
      include: {
        author: { select: { name: true } },
        updatedBy: { select: { name: true } },
      },
    });

    const processedEntries = historyEntries.map(processEntry);
    const filteredEntries = processedEntries.filter((entry) => entry.promene !== null);

    return new Response(JSON.stringify(filteredEntries), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store, max-age=0",
      },
    });

  } catch (error) {
    console.error("Greška pri dohvatanju istorije:", error);

    let errorMessage = "Interna serverska greška";
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      errorMessage = getErrorMessage(error.code) || error.message;
    }

    return new Response(
      JSON.stringify({
        success: false,
        message: errorMessage,
        error: error instanceof Error ? error.message : "Nepoznata greška",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}