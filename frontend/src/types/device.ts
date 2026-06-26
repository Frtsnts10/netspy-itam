export interface Device {
  mac_address: string;
  custom_name: string | null;
  last_known_ip: string;
  vendor: string | null;
  is_managed: boolean;
  cpu_model: string | null;
  ram_gb: number | null;
  os_version: string | null;
  hostname: string | null;
  last_seen: string;
}

export interface ScanResult {
  message: string;
  devices: Device[];
}
