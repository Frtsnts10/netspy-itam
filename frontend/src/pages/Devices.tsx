import { useState } from "react";
import { toast } from "sonner";
import { useDevices, useUpdateDeviceName, useTriggerScan } from "../hooks/useDevices";
import DeviceTable from "../components/devices/DeviceTable";
import DeviceDetail from "../components/devices/DeviceDetail";
import ScanButton from "../components/scanner/ScanButton";
import type { Device } from "../types/device";

export default function DevicesPage() {
  const { data: devices = [], isLoading } = useDevices();
  const updateName = useUpdateDeviceName();
  const triggerScan = useTriggerScan();
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);

  const handleScan = () => {
    triggerScan.mutate(undefined, {
      onSuccess: (data) => {
        toast.success(data.message);
      },
      onError: (err) => {
        toast.error(`Scan failed: ${err.message}`);
      },
    });
  };

  const handleRename = (mac_address: string, custom_name: string) => {
    updateName.mutate(
      { mac_address, custom_name },
      {
        onSuccess: () => toast.success("Device name updated"),
        onError: (err) => toast.error(`Rename failed: ${err.message}`),
      },
    );
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-100">Network Devices</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage your network assets and endpoints
          </p>
        </div>
        <ScanButton onClick={handleScan} isLoading={triggerScan.isPending} />
      </div>

      <DeviceTable
        devices={devices}
        isLoading={isLoading}
        onSelect={setSelectedDevice}
        onRename={handleRename}
      />

      {selectedDevice && (
        <DeviceDetail
          device={
            devices.find((d) => d.mac_address === selectedDevice.mac_address) ||
            selectedDevice
          }
          onClose={() => setSelectedDevice(null)}
        />
      )}
    </>
  );
}
