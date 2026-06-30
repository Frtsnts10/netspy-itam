import { useMemo } from "react";
import { useDevices } from "../hooks/useDevices";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { Laptop, Server, Globe, MonitorSmartphone } from "lucide-react";

export default function DashboardPage() {
  const { data: devices = [], isLoading } = useDevices();

  const stats = useMemo(() => {
    const total = devices.length;
    const online = devices.filter(
      (d) => Date.now() - new Date(d.last_seen).getTime() < 5 * 60 * 1000
    ).length;
    const offline = total - online;
    const managed = devices.filter((d) => d.is_managed).length;

    const osCount: Record<string, number> = {};
    devices.forEach((d) => {
      if (d.os_version) {
        const os = d.os_version.toLowerCase().includes("windows") ? "Windows" :
                   d.os_version.toLowerCase().includes("linux") ? "Linux" :
                   d.os_version.toLowerCase().includes("mac") ? "macOS" : "Other";
        osCount[os] = (osCount[os] || 0) + 1;
      }
    });

    const osData = Object.entries(osCount).map(([name, value]) => ({ name, value }));
    const statusData = [
      { name: "Online", value: online },
      { name: "Offline", value: offline },
    ];

    return { total, online, offline, managed, osData, statusData };
  }, [devices]);

  const STATUS_COLORS = ["#22c55e", "#ef4444"];

  if (isLoading) {
    return <div className="text-gray-400">Loading dashboard data...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-100">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Analytics overview of your IT infrastructure
        </p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <StatCard title="Total Devices" value={stats.total} icon={<MonitorSmartphone className="w-5 h-5 text-blue-400" />} />
        <StatCard title="Online" value={stats.online} icon={<Globe className="w-5 h-5 text-green-400" />} />
        <StatCard title="Offline" value={stats.offline} icon={<Server className="w-5 h-5 text-red-400" />} />
        <StatCard title="Managed Agents" value={stats.managed} icon={<Laptop className="w-5 h-5 text-purple-400" />} />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="text-sm font-medium text-gray-400 mb-4">Device Status Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stats.statusData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: "#1f2937", border: "none", borderRadius: "8px", color: "#f3f4f6" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="text-sm font-medium text-gray-400 mb-4">Operating Systems</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.osData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#1f2937", border: "none", borderRadius: "8px", color: "#f3f4f6" }}
                  cursor={{ fill: "#374151", opacity: 0.4 }}
                />
                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon }: { title: string; value: number | string; icon: React.ReactNode }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        <p className="text-2xl font-bold text-gray-100 mt-1">{value}</p>
      </div>
      <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center">
        {icon}
      </div>
    </div>
  );
}
