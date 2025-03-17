// src/helpers/useFilters.ts
import { useState, useEffect } from "react";

export interface UseFiltersResult {
  providers: string[];
  activeProvider: string;
  setActiveProvider: (provider: string) => void;
  groupBy: string;
  handleGroupByChange: (event: React.ChangeEvent<{ value: unknown }>) => void;
  groupingMethod: string;
  handleGroupingMethodChange: (method: string) => void;
}

export const useFilters = (initialProviders: string[] = []): UseFiltersResult => {
  const [providers, setProviders] = useState<string[]>(initialProviders);
  const [activeProvider, setActiveProvider] = useState<string>("");
  const [groupBy, setGroupBy] = useState<string>("all");
  const [groupingMethod, setGroupingMethod] = useState<string>("month");

  useEffect(() => {
    // Optionally, fetch the providers if they are not passed as props
    // Example API call if needed
    // fetch('/api/providers')
    //   .then((res) => res.json())
    //   .then((data) => setProviders(data))
    //   .catch((error) => console.log('Error fetching providers:', error));
  }, []);

  const handleGroupByChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setGroupBy(event.target.value as string);
  };

  const handleGroupingMethodChange = (method: string) => {
    setGroupingMethod(method);
  };

  return {
    providers,
    activeProvider,
    setActiveProvider,
    groupBy,
    handleGroupByChange,
    groupingMethod,
    handleGroupingMethodChange,
  };
};
