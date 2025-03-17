"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function ImportButton() {
  const [loading, setLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importMessage, setImportMessage] = useState("");
  const [importLogs, setImportLogs] = useState<string[]>([]);

  const handleImport = async () => {
  setLoading(true);
  setIsProcessing(true);
  setImportMessage("");
  setImportLogs([]);

  try {
    const response = await fetch("/api/novi_import", { method: "POST" });
    const data = await response.json();

    console.log("🔍 API Response:", data);

    if (response.ok) {
      toast.success(`✅ ${data.message}`);
      setImportMessage(data.message);
      // Ako API vraća logove kao niz
      if (data.logs && Array.isArray(data.logs)) {
        setImportLogs(data.logs);
      }
    } else {
      toast.error(`❌ ${data.message}`);
      setImportMessage(data.message);
      if (data.logs && Array.isArray(data.logs)) {
        setImportLogs(data.logs);
      }
    }
  } catch (error) {
    console.error("❌ Error:", error);
    toast.error("❌ Error importing data!");
    setImportMessage("Došlo je do greške prilikom importovanja podataka.");
  } finally {
    setLoading(false);
    setIsProcessing(false);
  }
};


  return (
    <div className="space-y-4">
      <button
        onClick={handleImport}
        disabled={loading || isProcessing}
        className="px-4 py-2 bg-green-500 text-white rounded"
      >
        {loading ? "Učitavanje..." : "Pokreni Import"}
      </button>

      {isProcessing && (
        <div className="fixed top-0 left-0 right-0 bg-yellow-200 p-4 text-center text-black font-semibold">
          <p>🔄 Podaci se obrađuju, molimo sačekajte...</p>
        </div>
      )}

      {importMessage && !isProcessing && (
        <div className="mt-4 p-4 bg-green-100 text-green-800 rounded">
          <p>{importMessage}</p>
        </div>
      )}

      {importLogs.length > 0 && !isProcessing && (
        <div className="mt-4 p-4 bg-gray-100 text-gray-800 rounded">
          <h3 className="font-semibold text-lg">Log poruke:</h3>
          <pre className="whitespace-pre-wrap">
            {importLogs.map((log, index) => (
              <div key={index}>{log}</div>
            ))}
          </pre>
        </div>
      )}
    </div>
  );
}
