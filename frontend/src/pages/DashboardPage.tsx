import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { InterestedProductsTab } from "./dashboard/InterestedProductsTab";
import { MyInfoTab } from "./dashboard/MyInfoTab";
import { MyProductTab } from "./dashboard/MyProductTab";

type DashboardTab = "info" | "interested" | "product";

export function DashboardPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<DashboardTab>("info");

  const tabs: { id: DashboardTab; label: string }[] = [
    { id: "info", label: "My Info" },
    { id: "interested", label: "Interested" },
    ...(user?.role === "student" ? [{ id: "product" as const, label: "My Product" }] : []),
  ];

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col gap-4 px-4 pt-6 pb-24">
      <h1 className="text-navy text-xl font-bold">My Dashboard</h1>

      <div className="bg-canvas rounded-card flex gap-1 p-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`flex-1 rounded-full py-2 text-sm font-medium transition ${
              tab === t.id ? "bg-surface text-navy shadow-sm" : "text-muted"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "info" && <MyInfoTab />}
      {tab === "interested" && <InterestedProductsTab />}
      {tab === "product" && user?.role === "student" && <MyProductTab />}
    </main>
  );
}
