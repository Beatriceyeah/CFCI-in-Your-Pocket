export type Tab = "browse" | "dashboard";

interface BottomNavProps {
  active: Tab;
  onChange: (tab: Tab) => void;
}

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: "browse", label: "Browse", icon: "◎" },
  { id: "dashboard", label: "Dashboard", icon: "☰" },
];

export function BottomNav({ active, onChange }: BottomNavProps) {
  return (
    <nav className="bg-surface fixed inset-x-0 bottom-0 z-20 border-t border-black/5">
      <div className="mx-auto flex max-w-md">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`flex flex-1 flex-col items-center gap-0.5 py-3 text-xs font-medium ${
              active === tab.id ? "text-royal" : "text-muted"
            }`}
          >
            <span aria-hidden className="text-lg">
              {tab.icon}
            </span>
            {tab.label}
          </button>
        ))}
      </div>
    </nav>
  );
}
