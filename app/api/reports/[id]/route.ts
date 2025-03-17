// app/api/reports/[id]/route.ts
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const report = await prisma.report.findUnique({
    where: { id: params.id },
    include: { author: true }
  });

  if (!report) return new Response("Not found", { status: 404 });

  const csv = convertToCSV(report.data);
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="${report.name}.csv"`
    }
  });
}