import { useState } from "react";
import { BottomNav } from "./components/BottomNav";
import type { Tab } from "./components/BottomNav";
import { LoginScreen } from "./components/LoginScreen";
import { ExternalOnboarding } from "./components/onboarding/ExternalOnboarding";
import { StudentOnboarding } from "./components/onboarding/StudentOnboarding";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { BrowsePage } from "./pages/BrowsePage";
import { DashboardPage } from "./pages/DashboardPage";

function Shell() {
  const [tab, setTab] = useState<Tab>("browse");
  return (
    <>
      {tab === "browse" ? <BrowsePage /> : <DashboardPage />}
      <BottomNav active={tab} onChange={setTab} />
    </>
  );
}

function AppRoutes() {
  const { user, status } = useAuth();

  if (status === "loading") {
    return <p className="text-muted flex min-h-dvh items-center justify-center">Loading…</p>;
  }
  if (!user) return <LoginScreen />;
  if (!user.onboarded) {
    return user.role === "student" ? <StudentOnboarding /> : <ExternalOnboarding />;
  }
  return <Shell />;
}

export function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
