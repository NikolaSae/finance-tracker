import { Suspense } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Layout from "@/components/Layout";
import ExportButton from "@/components/ExportButton";
import GlobalLoading from "@/components/GlobalLoading";
import PuniButton from "@/components/PuniButton";
import ImportButton from "@/components/ImportButton";

export default async function ReportsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return <p>Neovlašćen pristup, molim vas da se prijavite!</p>;
  }


  return (
    <Layout>
      <Suspense fallback={<GlobalLoading />}>
        <h1>Reports</h1>
        <p>Here are your financial reports.</p>
        
        <div className="mt-4">
          <ExportButton />
        </div>

        <div className="flex flex-col items-center justify-center min-h-screen">
          <h1 className="text-2xl mb-14">Import Data</h1>

          {/* Dva dugmeta u istoj liniji */}
          <div className="flex flex-row gap-6">
            <PuniButton />
            <ImportButton />
          </div>

          {/* Dva prozora sa podacima ispod */}
          <div className="grid grid-cols-2 gap-6 mt-6 w-full max-w-4xl">
            {/* PuniButton prozor */}
            <div className="p-4 bg-green-100 rounded-lg shadow-md min-h-[200px] w-full">
              <h3 className="font-semibold text-lg text-green-800">Ažurirani podaci</h3>
              <p className="text-gray-600">Ovde će biti prikazani podaci.</p>
            </div>

            {/* ImportButton prozor */}
            <div className="p-4 bg-gray-100 rounded-lg shadow-md min-h-[200px] w-full">
              <h3 className="font-semibold text-lg text-gray-800">Log poruke</h3>
              <p className="text-gray-600">Ovde će biti prikazane log poruke.</p>
            </div>
          </div>
        </div>
      </Suspense>
    </Layout>
  );
}
