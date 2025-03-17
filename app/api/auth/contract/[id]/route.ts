import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const contract = await prisma.humanitarniUgovori.findUnique({
      where: { id: Number(params.id) },
    });

    if (!contract) {
      return new Response(JSON.stringify({ message: "Contract not found" }), { status: 404 });
    }

    return new Response(JSON.stringify(contract), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ message: "Error fetching contract", error: String(error) }), { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();

    const updatedContract = await prisma.humanitarniUgovori.update({
      where: { id: Number(params.id) },
      data: body,
    });

    return new Response(JSON.stringify({ message: "Contract updated", contract: updatedContract }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ message: "Error updating contract", error: String(error) }), { status: 500 });
  }
}
