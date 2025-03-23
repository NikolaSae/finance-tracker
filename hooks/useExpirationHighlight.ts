import { useEffect } from "react";

const useExpirationHighlight = (contractsData) => {
  useEffect(() => {
    const today = new Date();
    contractsData.forEach((contract) => {
      const expirationDate = new Date(contract.datumIstekka);
      if (isNaN(expirationDate.getTime())) return;

      const diffTime = expirationDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 3600 * 24));

      if (diffDays >= 0 && diffDays <= 30) {
        contract.isExpiring = true;
      } else if (diffDays < 0) {
        contract.isExpired = true;
      }
    });
  }, [contractsData]);
};

export default useExpirationHighlight;
