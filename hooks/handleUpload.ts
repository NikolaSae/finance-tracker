// hooks/handleUpload.ts
import { useState } from "react";

export const useUpload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [excelData, setExcelData] = useState<any[][] | null>(null);

  const handleUpload = async () => {
    if (!file) {
      alert("Izaberi fajl!");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/excel-analysis", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setExcelData(data.data);
        console.log("File uploaded and data received:", data.data);  // For frontend debug
      } else {
        alert("Greška pri učitavanju fajla!");
        console.error("Error uploading file:", response.statusText);  // For frontend debug
      }
    } catch (error) {
      alert("Greška pri slanju zahteva!");
      console.error("Error uploading file:", error);  // For frontend debug
    }
  };

  return { file, setFile, excelData, handleUpload };
};
