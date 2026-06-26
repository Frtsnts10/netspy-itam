import InlineEdit from "./InlineEdit";
import type { Device } from "../../types/device";

interface DeviceRowProps {
  device: Device;
  onSelect: (device: Device) => void;
  onRename: (mac_address: string, custom_name: string) => void;
}

export default function DeviceRow({ device, onSelect, onRename }: DeviceRowProps) {
  const isOnline =
    Date.now() - new Date(device.last_seen).getTime() < 5 * 60 * 1000;

  const displayName =
    device.custom_name ||
    device.hostname ||
    device.vendor ||
    "Unknown Device";

  return (
    <tr
      className="border-b border-gray-800 hover:bg-gray-900/60 cursor-pointer transition"
      onClick={() => onSelect(device)}
    >
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <div
            className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
              isOnline
                ? "bg-green-400 shadow-[0_0_6px_rgba(74,222,128,0.4)]"
                : "bg-red-400"
            }`}
          />
          <span className="text-xs text-gray-500">
            {isOnline ? "Online" : "Offline"}
          </span>
        </div>
      </td>
      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
        <InlineEdit
          value={displayName}
          placeholder="Unnamed Device"
          onSave={(name) => onRename(device.mac_address, name)}
        />
        {device.is_managed && (
          <span className="ml-2 text-[10px] bg-cyan-500/10 text-cyan-400 px-1.5 py-0.5 rounded font-medium">
            Managed
          </span>
        )}
      </td>
      <td className="px-4 py-3 text-sm text-gray-300 font-mono">
        {device.last_known_ip}
      </td>
      <td className="px-4 py-3 text-sm text-gray-400 font-mono">
        {device.mac_address}
      </td>
      <td className="px-4 py-3 text-sm text-gray-400">
        {device.vendor || "—"}
      </td>
      <td className="px-4 py-3 text-xs text-gray-500">
        {formatRelativeTime(device.last_seen)}
      </td>
    </tr>
  );
}

function formatRelativeTime(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
