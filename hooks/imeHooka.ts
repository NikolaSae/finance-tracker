import { useCallback } from 'react';
import { ExportAsCsv, ExportAsExcel, ExportAsPdf } from '@siamf/react-export';

const useDataExport = (data: any[]) => {
  const handleExportCsv = useCallback(() => {
    if (data.length === 0) {
      alert('Nema podataka za eksportovanje.');
      return;
    }
    // Logika za eksportovanje u CSV
    ExportAsCsv({ data });
  }, [data]);

  const handleExportExcel = useCallback(() => {
    if (data.length === 0) {
      alert('Nema podataka za eksportovanje.');
      return;
    }
    // Logika za eksportovanje u Excel
    ExportAsExcel({ data });
  }, [data]);

  const handleExportPdf = useCallback(() => {
    if (data.length === 0) {
      alert('Nema podataka za eksportovanje.');
      return;
    }
    // Logika za eksportovanje u PDF
    ExportAsPdf({ data });
  }, [data]);

  return { handleExportCsv, handleExportExcel, handleExportPdf };
};

export default useDataExport;
