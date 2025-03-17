"use client"; // Dodajte ovu liniju na početku fajla

export default function ImportForm() {
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const formData = new FormData();
      formData.append('file', file);
      await fetch('/api/import', {
        method: 'POST',
        body: formData,
      });
    }
  };

  return (
    <div>
      <input type="file" accept=".csv" onChange={handleFileUpload} />
    </div>
  );
}