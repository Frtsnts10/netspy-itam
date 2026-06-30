import { AlertTriangle, Info, ShieldAlert, CheckCircle2, Loader2, Bell } from "lucide-react";
import { useAlerts } from "../hooks/useData";

export default function AlertsPage() {
  const { data = [], isLoading } = useAlerts();
  const alerts = data as any[];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between border-b border-gray-800 pb-4">
        <div>
          <h1 className="text-xl font-bold text-gray-100">Alerts & Security</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Real-time security notifications and network events
          </p>
        </div>
        <button className="text-sm text-cyan-400 hover:text-cyan-300 font-medium transition">
          Mark all as read
        </button>
      </div>

      <div className="relative ml-4 space-y-8 pb-10">
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
          </div>
        ) : alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500">
            <Bell className="w-12 h-12 mb-4 opacity-50" />
            <p>No alerts generated yet. Run a network scan to detect devices.</p>
          </div>
        ) : (
          <div className="border-l border-gray-800 pl-8 relative">
            {alerts.map((alert: any) => {
              const type = alert.type || "info";
              const colorClass = 
                type === "critical" ? "text-red-400 bg-red-500/10 border-red-500/30" :
                type === "warning" ? "text-yellow-400 bg-yellow-500/10 border-yellow-500/30" :
                type === "success" ? "text-green-400 bg-green-500/10 border-green-500/30" :
                "text-blue-400 bg-blue-500/10 border-blue-500/30";

              const iconColorClass = 
                type === "critical" ? "text-red-400" :
                type === "warning" ? "text-yellow-400" :
                type === "success" ? "text-green-400" :
                "text-blue-400";

              const IconComponent = 
                type === "critical" ? ShieldAlert :
                type === "warning" ? AlertTriangle :
                type === "success" ? CheckCircle2 : Info;

              // Format date nicely
              const timeString = new Date(alert.created_at).toLocaleString();

              return (
                <div key={alert.id} className="relative mb-8 last:mb-0">
                  <span className={`absolute -left-[45px] top-1 w-6 h-6 rounded-full border flex items-center justify-center bg-gray-950 ${colorClass}`}>
                    <IconComponent className="w-3 h-3" />
                  </span>
                  
                  <div className={`bg-gray-900 border border-gray-800 rounded-xl p-4 transition cursor-pointer hover:border-gray-700 ${!alert.is_read ? 'bg-gray-800/50' : ''}`}>
                    <div className="flex items-center justify-between mb-1">
                      <h3 className={`font-semibold text-sm ${iconColorClass}`}>{alert.title}</h3>
                      <span className="text-xs text-gray-500">{timeString}</span>
                    </div>
                    <p className="text-sm text-gray-400">{alert.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
