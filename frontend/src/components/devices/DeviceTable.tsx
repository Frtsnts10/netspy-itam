import type { Device } from "../../types/device";
import DeviceRow from "./DeviceRow";
import { Loader2, Search } from "lucide-react";
import { useState } from "react";

interface DeviceTableProps {
  devices: Device[];
  isLoading: boolean;
  onSelect: (device: Device) => void;
  onRename: (mac_address: string, custom_name: string) => void;
}

export default function DeviceTable({
  devices,
  isLoading,
  onSelect,
  onRename,
}: DeviceTableProps) {
  const [filter, setFilter] = useState("");

  const filtered = devices.filter((d) => {
    const q = filter.toLowerCase();
    return (
      !q ||
      d.mac_address.toLowerCase().includes(q) ||
      d.last_known_ip.includes(q) ||
      (d.vendor || "").toLowerCase().includes(q) ||
      (d.custom_name || "").toLowerCase().includes(q) ||
      (d.hostname || "").toLowerCase().includes(q)
    );
  });

  const onlineCount = devices.filter(
    (d) => Date.now() - new Date(d.last_seen).getTime() < 5 * 60 * 1000,
  ).length;

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-gray-100">
            Network Devices
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            {devices.length} total &middot; {onlineCount} online
          </p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filter devices..."
            className="pl-9 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 w-60"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          {devices.length === 0
            ? "No devices found. Run a network sweep to discover devices."
            : "No devices match your filter."}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-xs text-gray-500 uppercase tracking-wider border-b border-gray-800">
                <th className="px-4 py-3 text-left w-28">Status</th>
                <th className="px-4 py-3 text-left">Device</th>
                <th className="px-4 py-3 text-left">IP Address</th>
                <th className="px-4 py-3 text-left">MAC Address</th>
                <th className="px-4 py-3 text-left">Vendor</th>
                <th className="px-4 py-3 text-left w-24">Last Seen</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((device) => (
                <DeviceRow
                  key={device.mac_address}
                  device={device}
                  onSelect={onSelect}
                  onRename={onRename}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
