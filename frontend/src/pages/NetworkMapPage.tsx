import { useState } from "react";
import { MonitorSmartphone, Server, Router, Smartphone, Laptop, RefreshCw } from "lucide-react";
import { useDevices } from "../hooks/useDevices";
import { apiFetch } from "../lib/api";

export default function NetworkMapPage() {
  const { data: devices = [], isLoading, refetch } = useDevices();
  const [isScanning, setIsScanning] = useState(false);

  // Helper to determine icon based on OS or vendor
  const getDeviceIcon = (device: any) => {
    const os = (device.os_version || "").toLowerCase();
    const vendor = (device.vendor || "").toLowerCase();
    
    if (os.includes("windows") || os.includes("mac") || os.includes("linux")) return Laptop;
    if (os.includes("server") || vendor.includes("vmware")) return Server;
    if (vendor.includes("apple") || vendor.includes("samsung")) return Smartphone;
    return MonitorSmartphone;
  };

  // Helper to calculate a rough circular position
  const getPosition = (index: number, total: number) => {
    if (total === 0) return { x: 50, y: 50 };
    const radius = 35; // 35% of the container
    const angle = (index / total) * 2 * Math.PI - Math.PI / 2; // start from top
    const x = 50 + radius * Math.cos(angle);
    const y = 50 + radius * Math.sin(angle);
    return { x, y };
  };
  
  const handleScan = async () => {
    setIsScanning(true);
    try {
      await apiFetch("/api/scan", { method: "POST" });
      await refetch();
    } catch (e) {
      alert("Scan failed.");
    } finally {
      setIsScanning(false);
    }
  };

  if (isLoading) {
    return <div className="p-6 text-gray-400">Loading map...</div>;
  }

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-gray-100">Network Topology</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Visual overview of your connected IT infrastructure
          </p>
        </div>
        <button 
          onClick={handleScan}
          disabled={isScanning}
          className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isScanning ? "animate-spin" : ""}`} />
          {isScanning ? "Scanning Subnet..." : "Scan Network"}
        </button>
      </div>
      
      <div className="flex-1 bg-gray-900 border border-gray-800 rounded-xl relative overflow-hidden flex items-center justify-center min-h-[500px]">
        {/* Background Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03]" 
          style={{ backgroundImage: "radial-gradient(#fff 1px, transparent 1px)", backgroundSize: "32px 32px" }}
        />
        
        {/* Network Graph */}
        <div className="relative w-full max-w-4xl h-full flex items-center justify-center p-12">
          
          {/* Central Router */}
          <div className="absolute z-10 flex flex-col items-center gap-2">
            <div className="w-20 h-20 bg-cyan-500/20 border-2 border-cyan-500/50 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(6,182,212,0.3)]">
              <Router className="w-10 h-10 text-cyan-400" />
            </div>
            <span className="text-sm font-medium text-cyan-400 bg-gray-950/80 px-2 rounded">Main Gateway</span>
            <span className="text-xs font-mono text-gray-500 bg-gray-950/80 px-2 rounded">192.168.1.1</span>
          </div>

          {/* Surrounding Nodes (Dynamic) */}
          {devices.map((device, i) => {
            if (device.last_known_ip === "192.168.1.1") return null; // Skip router
            
            const pos = getPosition(i, devices.length);
            const isOnline = Date.now() - new Date(device.last_seen).getTime() < 5 * 60 * 1000;
            const isUnknown = !device.vendor && !device.is_managed;

            return (
              <NetworkNode 
                key={device.mac_address}
                icon={getDeviceIcon(device)} 
                label={device.custom_name || device.hostname || device.vendor || "Unknown"} 
                ip={device.last_known_ip} 
                positionStyle={{ top: `${pos.y}%`, left: `${pos.x}%`, transform: 'translate(-50%, -50%)' }} 
                delay={`${i * 100}ms`} 
                active={isOnline}
                alert={isUnknown}
              />
            );
          })}

          {/* Connecting Lines (SVG) */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
            {devices.map((device, i) => {
              if (device.last_known_ip === "192.168.1.1") return null;
              const pos = getPosition(i, devices.length);
              const isOnline = Date.now() - new Date(device.last_seen).getTime() < 5 * 60 * 1000;
              const color = isOnline ? "#06b6d4" : "#1e293b";
              
              return (
                <line 
                  key={`line-${device.mac_address}`}
                  x1="50%" y1="50%" 
                  x2={`${pos.x}%`} y2={`${pos.y}%`} 
                  stroke={color} 
                  strokeWidth="2" 
                  strokeOpacity={isOnline ? 0.3 : 0.8}
                  strokeDasharray={isOnline ? "none" : "5,5"}
                />
              );
            })}
          </svg>
        </div>
      </div>
    </div>
  );
}

function NetworkNode({ icon: Icon, label, ip, positionStyle, delay, active, alert }: any) {
  const bgClass = alert ? "bg-red-500/10 border-red-500/50" : active ? "bg-cyan-500/10 border-cyan-500/50" : "bg-gray-800 border-gray-700";
  const textClass = alert ? "text-red-400" : active ? "text-cyan-400" : "text-gray-400";

  return (
    <div className={`absolute flex flex-col items-center gap-2 z-10 transition-transform hover:scale-110 cursor-pointer`} style={{ ...positionStyle, animationDelay: delay }}>
      <div className={`w-14 h-14 rounded-xl border flex items-center justify-center backdrop-blur-md ${bgClass} shadow-lg relative`}>
        <Icon className={`w-6 h-6 ${textClass} relative z-10`} />
        {active && (
          <div className="absolute inset-0 bg-cyan-400/20 rounded-xl animate-ping" />
        )}
      </div>
      <div className="flex flex-col items-center bg-gray-950/80 px-2 py-1 rounded border border-gray-800 max-w-[120px]">
        <span className="text-xs font-medium text-gray-200 truncate w-full text-center">{label}</span>
        <span className="text-[10px] font-mono text-gray-500">{ip}</span>
      </div>
    </div>
  );
}
