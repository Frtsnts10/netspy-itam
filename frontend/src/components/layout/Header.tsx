import { Shield, LogOut } from "lucide-react";

interface HeaderProps {
  email: string;
  onSignOut: () => void;
}

export default function Header({ email, onSignOut }: HeaderProps) {
  return (
    <header className="bg-gray-900 border-b border-gray-800 px-6 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-cyan-500/10 rounded-lg flex items-center justify-center">
            <Shield className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-100 leading-tight">
              NetSpy ITAM
            </h1>
            <p className="text-xs text-gray-500">IT Asset Management</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-400">{email}</span>
          <button
            onClick={onSignOut}
            className="p-2 text-gray-400 hover:text-gray-200 hover:bg-gray-800 rounded-lg transition"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
