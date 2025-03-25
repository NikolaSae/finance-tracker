// hooks/useContracts.ts
import { useState, useEffect, useCallback } from "react";
import { fetchContracts } from "@/lib/api/contracts";

export function useContracts(accessToken: string, status: string, router: any) {
  const [contracts, setContracts] = useState([]);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const refreshContracts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchContracts(accessToken);
      setContracts(data);
      setError("");
    } catch (err) {
      setError("Greška pri učitavanju podataka");
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    if (status === "authenticated") {
      refreshContracts();
    } else if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router, refreshContracts]);

  return { contracts, error, loading, refreshContracts, setContracts };
}
