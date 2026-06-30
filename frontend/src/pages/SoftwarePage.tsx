import { Search, Filter, Download, Loader2 } from "lucide-react";
import { useSoftware } from "../hooks/useData";

export default function SoftwarePage() {
  const { data = [], isLoading } = useSoftware();
  const software = data as any[];

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-100">Software Inventory</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Track installed applications across your network
          </p>
        </div>
        <button className="flex items-center gap-2 bg-gray-800 text-gray-300 hover:text-white px-4 py-2 rounded-lg text-sm font-medium transition border border-gray-700">
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>
      
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden shadow-xl flex-1 flex flex-col">
        <div className="p-4 border-b border-gray-800 flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search software by name or vendor..." 
              className="w-full bg-gray-950 border border-gray-800 rounded-lg pl-9 pr-4 py-2 text-sm text-gray-200 focus:outline-none focus:border-cyan-500/50 transition-colors"
            />
          </div>
          <button className="p-2 border border-gray-800 rounded-lg text-gray-400 hover:text-gray-200 hover:bg-gray-800 transition">
            <Filter className="w-4 h-4" />
          </button>
        </div>
        
        <div className="overflow-auto flex-1">
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
            </div>
          ) : software.length === 0 ? (
            <div className="flex justify-center items-center h-40 text-gray-500 text-sm">
              No software data found. Ensure the telemetry agent is running on target devices.
            </div>
          ) : (
            <table className="w-full text-left text-sm text-gray-400">
              <thead className="bg-gray-800/50 text-xs uppercase text-gray-500 border-b border-gray-800 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-4 font-medium">Application Name</th>
                  <th className="px-6 py-4 font-medium">Version</th>
                  <th className="px-6 py-4 font-medium">Publisher</th>
                  <th className="px-6 py-4 font-medium text-right">Installed On</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {software.map((sw: any) => (
                  <tr key={sw.id} className="hover:bg-gray-800/20 transition group">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-200">{sw.name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs px-2 py-1 bg-gray-800 rounded text-gray-300">
                        {sw.version || "Unknown"}
                      </span>
                    </td>
                    <td className="px-6 py-4">{sw.vendor || "-"}</td>
                    <td className="px-6 py-4 text-right">
                      <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 font-medium">
                        {sw.deviceCount} devices
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
