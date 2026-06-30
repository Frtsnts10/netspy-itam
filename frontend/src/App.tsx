import { Toaster } from "sonner";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import LoginPage from "./components/auth/LoginPage";
import AppShell from "./components/layout/AppShell";
import Header from "./components/layout/Header";
import DashboardPage from "./pages/Dashboard";
import DevicesPage from "./pages/Devices";
import SoftwarePage from "./pages/SoftwarePage";
import NetworkMapPage from "./pages/NetworkMapPage";
import AlertsPage from "./pages/AlertsPage";
import { Loader2 } from "lucide-react";

export default function App() {
  const { user, loading, signIn, signOut } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <Toaster position="top-right" theme="dark" />
        <LoginPage onSignIn={signIn} />
      </>
    );
  }

  const header = <Header email={user.email || ""} onSignOut={signOut} />;

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        theme="dark"
        toastOptions={{
          style: {
            background: "#111118",
            border: "1px solid #1e1e2a",
            color: "#e8e8f0",
          },
        }}
      />
      <AppShell header={header}>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/devices" element={<DevicesPage />} />
          <Route path="/software" element={<SoftwarePage />} />
          <Route path="/map" element={<NetworkMapPage />} />
          <Route path="/alerts" element={<AlertsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  );
}
