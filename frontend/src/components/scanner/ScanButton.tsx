import { Loader2, Radar } from "lucide-react";

interface ScanButtonProps {
  onClick: () => void;
  isLoading: boolean;
}

export default function ScanButton({ onClick, isLoading }: ScanButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className="flex items-center gap-2 px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 disabled:bg-cyan-500/50 text-gray-950 font-semibold rounded-lg transition text-sm"
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Scanning Network...
        </>
      ) : (
        <>
          <Radar className="w-4 h-4" />
          Run Network Sweep
        </>
      )}
    </button>
  );
}
