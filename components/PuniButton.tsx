"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function PuniButton() {
  const [loading, setLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false); // New state for tracking update process
  const [updatedFiles, setUpdatedFiles] = useState<string[]>([]); // State to track updated data

  const handleImport = async () => {
    setLoading(true);
    setIsUpdating(true); // Start the update process

    try {
      const response = await fetch("/api/puni", { method: "POST" });
      const data = await response.json();

      if (response.ok) {
        toast.success("✅ Podaci uspešno uvezeni!");
        setUpdatedFiles(data.updatedFiles); // Update the list of updated files
      } else {
        toast.error("❌ Greška pri uvozu podataka!");
      }
    } catch (error) {
      toast.error("❌ Greška pri uvozu podataka!");
    } finally {
      setLoading(false);
      setIsUpdating(false); // End the update process once done
    }
  };

  return (
    <div className="space-y-4">
      <button
        onClick={handleImport}
        disabled={loading}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        {loading ? "Učitavanje..." : "Pokreni Import"}
      </button>

      {/* Conditional container for update state */}
      {isUpdating && (
        <div className="fixed top-0 left-0 right-0 bg-yellow-200 p-4 text-center text-black font-semibold">
          <p>🔄 Podaci se ažuriraju, molimo sačekajte...</p>
        </div>
      )}

      {/* Display updated data */}
      {updatedFiles.length > 0 && !isUpdating && (
        <div className="mt-6 p-4 bg-green-100 rounded-lg">
          <h3 className="font-semibold text-lg">Ažurirani podaci:</h3>
          <ul className="list-disc pl-5">
            {updatedFiles.map((file, index) => (
              <li key={index}>{file}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
