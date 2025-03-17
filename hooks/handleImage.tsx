import { useState } from "react";

export const useUpload = () => {
  const [file, setFile] = useState<File | null>(null);

  const handleUpload = async () => {
    if (file) {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        return data;
      } else {
        console.error(data.error);
        return null;
      }
    }
  };

  return { file, setFile, handleUpload };
};
