import { NavLink } from "react-router-dom";
import { LayoutDashboard, Server, Box, Map as MapIcon, Bell } from "lucide-react";

export default function Sidebar() {
  const navItems = [
    { label: "Dashboard", icon: LayoutDashboard, path: "/" },
    { label: "Devices", icon: Server, path: "/devices" },
    { label: "Software Inventory", icon: Box, path: "/software" },
    { label: "Network Map", icon: MapIcon, path: "/map" },
    { label: "Alerts & Security", icon: Bell, path: "/alerts" },
  ];

  return (
    <div className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
      <div className="p-4 flex-1">
        <nav className="space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm font-medium ${
                  isActive
                    ? "bg-cyan-500/10 text-cyan-400"
                    : "text-gray-400 hover:text-gray-200 hover:bg-gray-800/50"
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
      
      <div className="p-4 border-t border-gray-800 text-xs text-gray-600">
        NetSpy ITAM v1.0.0
      </div>
    </div>
  );
}
