import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  if (session) {
    // Ako postoji sesija, preusmeri na dashboard
    redirect("/dashboard");
  } else {
    // Ako nema sesije, preusmeri na login stranicu
    redirect("/auth/login");
  }

  // Loading state - Ovo će se prikazati dok se ne izvrši redirekcija
  return <div>Loading...</div>;
}