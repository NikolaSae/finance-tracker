import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

interface ContractScanResult {
  id: number;
  humanitarnaOrganizacija: string;
  kratkiBroj?: string;
  status: string;
  isExpired: boolean;
  paymentOverdue: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export async function POST() {
  try {
    // Scan contracts that need attention
    const contractsToReview: ContractScanResult[] = await prisma.humanitarniUgovori.findMany({
      where: {
        OR: [
          { status: "NEEDS_REVIEW" },
          { isExpired: true },
          { paymentOverdue: true }
        ]
      },
      take: 100 // Limit results
    });

    return NextResponse.json({
      success: true,
      count: contractsToReview.length,
      results: contractsToReview
    });
  } catch (error) {
    console.error("Scan error:", error);
    return NextResponse.json(
      { success: false, error: "Došlo je do greške prilikom skeniranja" },
      { status: 500 }
    );
  }
}
