import type { ReactNode } from "react";
import Sidebar from "./Sidebar";

interface AppShellProps {
  header: ReactNode;
  children: ReactNode;
}

export default function AppShell({ header, children }: AppShellProps) {
  return (
    <div className="h-screen bg-gray-950 flex flex-col overflow-hidden">
      {header}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
