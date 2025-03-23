// utils/formatMonth.ts

export interface FormattedViewRow {
    id?: string;
    Mesec_pruzanja_usluge: string;
    Provajder?: string;
    provider_name?: string;
    [key: string]: any;
  }
  
  export const formatMonthData = (data: FormattedViewRow[]): FormattedViewRow[] => {
    if (!Array.isArray(data)) return [];
    
    return data.map(item => {
      try {
        const originalDate = item.Mesec_pruzanja_usluge;
        const formattedDate = new Date(originalDate).toLocaleDateString('sr-Latn-RS', {
          month: '2-digit',
          year: 'numeric'
        });
  
        return {
          ...item,
          Mesec_pruzanja_usluge: formattedDate
        };
      } catch (error) {
        console.error('Greška pri formatiranju datuma:', error);
        return {
          ...item,
          Mesec_pruzanja_usluge: 'N/A'
        };
      }
    });
  };
  
  // Pomocna funkcija za TypeScript type guard
  export const isViewRow = (data: any): data is FormattedViewRow => {
    return typeof data === 'object' && 
           'Mesec_pruzanja_usluge' in data;
  };