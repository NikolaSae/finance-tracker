import { useQuery } from "@tanstack/react-query";

const fetchBulkServisi = async () => {
  const response = await fetch('/api/bulk-servisi');
  if (!response.ok) throw new Error('Error fetching bulk services');
  return response.json();
};

export const useBulkServisi = () => {
  return useQuery(['bulk-servisi'], fetchBulkServisi);
};
