import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // Osnovne statistike
    const totalStats = await prisma.transaction.aggregate({
      _count: { id: true },
      _sum: { amount: true },
      _avg: { amount: true }
    });

    return NextResponse.json({
      totalTransactions: totalStats._count.id,
      totalAmount: totalStats._sum.amount,
      averageAmount: totalStats._avg.amount
    });
    
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}