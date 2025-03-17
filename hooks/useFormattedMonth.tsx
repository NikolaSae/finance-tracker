import { useState, useEffect } from "react";

// Custom hook to format "Mesec pružanja usluge"
const useFormattedMonth = (data: any[]) => {
  const [formattedData, setFormattedData] = useState<any[]>([]);

  useEffect(() => {
    const formatMonth = (month: string) => {
      const [monthNumber, year] = month.split('.');
      const date = new Date(`${year}-${monthNumber}-01`);
      return date.toLocaleString('en-US', { month: 'short', year: 'numeric' });
    };

    const processedData = data.map((row) => {
      const formattedRow = { ...row };
      if (formattedRow["Mesec pružanja usluge"]) {
        formattedRow["Mesec pružanja usluge"] = formatMonth(formattedRow["Mesec pružanja usluge"]);
      }
      return formattedRow;
    });

    setFormattedData(processedData);
  }, [data]);

  return formattedData;
};

export default useFormattedMonth;
