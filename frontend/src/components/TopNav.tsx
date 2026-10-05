export type Tab = "browse" | "dashboard";

interface Props {
  tab: Tab;
  onTab: (tab: Tab) => void;
  onSignOut: () => void;
}

const TABS: { id: Tab; label: string }[] = [
  { id: "browse", label: "Browse" },
  { id: "dashboard", label: "My Dashboard" },
];

export function TopNav({ tab, onTab, onSignOut }: Props) {
  return (
    <header className="bg-navy text-surface sticky top-0 z-10">
      <div className="mx-auto flex max-w-3xl items-center gap-2 px-4 py-3">
        <span className="mr-auto text-base font-bold tracking-tight">CFCI in Your Pocket</span>
        <nav aria-label="Main" className="flex gap-1">
          {TABS.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              aria-current={tab === id ? "page" : undefined}
              onClick={() => onTab(id)}
              className={`rounded-full px-3 py-1.5 text-sm font-medium ${
                tab === id ? "bg-surface text-navy" : "text-surface/80 hover:text-surface"
              }`}
            >
              {label}
            </button>
          ))}
        </nav>
        <button
          type="button"
          onClick={onSignOut}
          className="text-surface/70 hover:text-surface ml-1 text-xs underline-offset-2 hover:underline"
        >
          Sign out
        </button>
      </div>
    </header>
  );
}
