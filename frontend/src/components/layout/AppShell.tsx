import type { ReactNode } from "react";

interface AppShellProps {
  header: ReactNode;
  children: ReactNode;
}

export default function AppShell({ header, children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      {header}
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
