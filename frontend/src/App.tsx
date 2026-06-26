import { Toaster } from "sonner";
import { useAuth } from "./hooks/useAuth";
import LoginPage from "./components/auth/LoginPage";
import DashboardPage from "./pages/Dashboard";
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

  return (
    <>
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
      {user ? (
        <DashboardPage
          email={user.email || ""}
          onSignOut={signOut}
        />
      ) : (
        <LoginPage onSignIn={signIn} />
      )}
    </>
  );
}
