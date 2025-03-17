// /hooks/handleImportNew.ts

import { useState } from "react";

// Hook za import novih podataka
export const useHandleImportNew = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Funkcija za postavljanje fajla
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  // Funkcija za upload novog fajla
  const handleImportNew = async () => {
    if (!file) {
      setMessage("Please select a file.");
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/import/new", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Failed to upload file.");
      }

      const data = await res.json();
      if (data.error) {
        setMessage(data.error);
      } else {
        setMessage("File successfully uploaded and processed.");
      }
    } catch (error) {
      setMessage("Error uploading file: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    file,
    setFile,
    handleFileChange,
    handleImportNew,
    isLoading,
    message,
  };
};
