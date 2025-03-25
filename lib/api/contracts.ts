// lib/api/contracts.ts
export async function fetchContracts(accessToken: string) {
  const response = await fetch("/api/contract", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  if (response.status === 401) {
    throw new Error("Unauthorized");
  }
  if (!response.ok) throw new Error("Error fetching contracts");
  return response.json();
}

export async function fetchContractHistory(contractId: number) {
  const response = await fetch(`/api/contract/history?originalId=${contractId}`);
  if (!response.ok) throw new Error("Error fetching contract history");
  return response.json();
}

export async function createContract(newContract: any) {
  const response = await fetch("/api/contract", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newContract),
  });
  if (!response.ok) throw new Error("Error creating contract");
  return response.json();
}
