import { X, Cpu, MemoryStick, Monitor, Wifi } from "lucide-react";
import type { Device } from "../../types/device";

interface DeviceDetailProps {
  device: Device;
  onClose: () => void;
}

export default function DeviceDetail({ device, onClose }: DeviceDetailProps) {
  const isOnline =
    Date.now() - new Date(device.last_seen).getTime() < 5 * 60 * 1000;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md bg-gray-900 border-l border-gray-800 h-full overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-100">
            Device Details
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-200 hover:bg-gray-800 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex items-center gap-3">
            <div
              className={`w-3 h-3 rounded-full ${isOnline ? "bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]" : "bg-red-400"}`}
            />
            <div>
              <p className="text-lg font-medium text-gray-100">
                {device.custom_name || device.vendor || device.hostname || "Unknown Device"}
              </p>
              <p className="text-sm text-gray-500">
                {isOnline ? "Online" : "Offline"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <InfoCard label="IP Address" value={device.last_known_ip} />
            <InfoCard label="MAC Address" value={device.mac_address} />
            <InfoCard label="Vendor" value={device.vendor || "Unknown"} />
            <InfoCard label="Hostname" value={device.hostname || "—"} />
          </div>

          {device.is_managed && (
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-3 uppercase tracking-wider">
                Hardware Telemetry
              </h3>
              <div className="space-y-3">
                <TelemetryRow
                  icon={<Cpu className="w-4 h-4 text-cyan-400" />}
                  label="CPU"
                  value={device.cpu_model || "—"}
                />
                <TelemetryRow
                  icon={<MemoryStick className="w-4 h-4 text-cyan-400" />}
                  label="RAM"
                  value={device.ram_gb ? `${device.ram_gb} GB` : "—"}
                />
                <TelemetryRow
                  icon={<Monitor className="w-4 h-4 text-cyan-400" />}
                  label="OS"
                  value={device.os_version || "—"}
                />
              </div>
            </div>
          )}

          {!device.is_managed && (
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 text-center">
              <Wifi className="w-6 h-6 text-gray-600 mx-auto mb-2" />
              <p className="text-sm text-gray-400">
                No telemetry agent installed on this device.
              </p>
              <p className="text-xs text-gray-600 mt-1">
                Deploy the agent to view CPU, RAM, and OS details.
              </p>
            </div>
          )}

          <div className="text-xs text-gray-600 pt-4 border-t border-gray-800">
            Last seen: {new Date(device.last_seen).toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-800/50 rounded-lg px-3 py-2.5">
      <p className="text-xs text-gray-500 mb-0.5">{label}</p>
      <p className="text-sm text-gray-200 font-mono truncate">{value}</p>
    </div>
  );
}

function TelemetryRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 bg-gray-800/50 rounded-lg px-3 py-2.5">
      {icon}
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm text-gray-200">{value}</p>
      </div>
    </div>
  );
}
