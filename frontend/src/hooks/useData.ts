import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../lib/api";

export function useAlerts() {
  return useQuery({
    queryKey: ["alerts"],
    queryFn: async () => {
      const data = await apiFetch("/api/alerts");
      return data;
    },
    refetchInterval: 10000,
  });
}

export function useSoftware() {
  return useQuery({
    queryKey: ["software"],
    queryFn: async () => {
      const data = await apiFetch("/api/software");
      return data;
    },
  });
}
