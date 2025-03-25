// hooks/useContractHistory.ts
import { useState } from "react";
import { fetchContractHistory } from "@/lib/api/contracts";

export function useContractHistory() {
  const [historyData, setHistoryData] = useState<{ [key: number]: any[] }>({});
  const [loadingContractId, setLoadingContractId] = useState<number | null>(null);

  const loadHistory = async (contractId: number) => {
    setLoadingContractId(contractId);
    try {
      const data = await fetchContractHistory(contractId);
      setHistoryData(prev => ({ ...prev, [contractId]: data }));
    } catch (err) {
      throw new Error("Greška pri učitavanju istorije");
    } finally {
      setLoadingContractId(null);
    }
  };

  return { historyData, loadingContractId, loadHistory };
}
