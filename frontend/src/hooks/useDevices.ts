import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "../lib/api";
import type { Device, ScanResult } from "../types/device";

export function useDevices() {
  return useQuery<Device[]>({
    queryKey: ["devices"],
    queryFn: () => apiFetch<Device[]>("/api/devices"),
  });
}

export function useUpdateDeviceName() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      mac_address,
      custom_name,
    }: {
      mac_address: string;
      custom_name: string;
    }) =>
      apiFetch<Device>(`/api/devices/${encodeURIComponent(mac_address)}`, {
        method: "PATCH",
        body: JSON.stringify({ custom_name }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["devices"] });
    },
  });
}

export function useTriggerScan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => apiFetch<ScanResult>("/api/scan", { method: "POST" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["devices"] });
    },
  });
}
