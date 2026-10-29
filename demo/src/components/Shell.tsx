import { useState, type ReactNode } from "react";
import { DEFAULT_STAFF_ID, DEFAULT_STUDENT_ID } from "../data/users";
import { useStore } from "../store/StoreContext";
import type { Persona, Provider } from "../types";
import { Icon, type IconName } from "./Icon";

export interface NavItem {
  key: string;
  label: string;
  icon: IconName;
  badge?: number;
}

const PERSONAS: {
  persona: Persona;
  provider: Provider;
  userId?: string;
  label: string;
  caption: string;
}[] = [
  {
    persona: "external",
    provider: "linkedin",
    label: "Investor or alum",
    caption: "Browse, shortlist, evaluate",
  },
  {
    persona: "team",
    provider: "duke_netid",
    userId: DEFAULT_STUDENT_ID,
    label: "Student team",
    caption: "Process feedback, update product",
  },
  {
    persona: "admin",
    provider: "duke_netid",
    userId: DEFAULT_STAFF_ID,
    label: "CFCI admin",
    caption: "Engagement, upload projects, sharing",
  },
];

function PersonaSwitcher() {
  const { state, dispatch } = useStore();
  const [open, setOpen] = useState(false);
  const session = state.session;
  const current = PERSONAS.find((p) => p.persona === session?.persona);
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/20"
      >
        <span className="size-1.5 rounded-full bg-interest" />
        Demo: {current?.label}
      </button>
      {open && (
        <ul className="absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-2xl bg-surface text-ink shadow-xl ring-1 ring-line">
          {PERSONAS.map((p) => (
            <li key={p.label}>
              <button
                type="button"
                onClick={() => {
                  dispatch({
                    type: "login",
                    persona: p.persona,
                    provider: p.provider,
                    userId: p.userId,
                  });
                  setOpen(false);
                }}
                className="flex w-full flex-col px-4 py-3 text-left hover:bg-canvas"
              >
                <span className="font-semibold">{p.label}</span>
                <span className="text-xs text-muted">{p.caption}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

interface Props {
  nav: NavItem[];
  active: string;
  onNav: (key: string) => void;
  wide: boolean;
  children: ReactNode;
}

export function Shell({ nav, active, onNav, wide, children }: Props) {
  const width = wide ? "max-w-5xl" : "max-w-md";
  return (
    <div className="flex h-full flex-col">
      <header className="bg-navy text-white">
        <div
          className={`mx-auto flex w-full items-center justify-between gap-3 px-4 py-3 ${width}`}
        >
          <p className="font-display text-lg font-bold leading-none">
            CFCI{" "}
            <span className="font-medium text-white/70">in Your Pocket</span>
          </p>
          <PersonaSwitcher />
        </div>
        {wide && (
          <nav
            className={`mx-auto flex w-full gap-1 px-4 ${width}`}
            aria-label="Sections"
          >
            {nav.map((n) => (
              <button
                key={n.key}
                type="button"
                onClick={() => onNav(n.key)}
                aria-current={active === n.key ? "page" : undefined}
                className={`rounded-t-xl px-4 py-2.5 text-sm font-semibold ${
                  active === n.key
                    ? "bg-canvas text-navy"
                    : "text-white/70 hover:text-white"
                }`}
              >
                {n.label}
                {!!n.badge && (
                  <span className="ml-1.5 rounded-full bg-interest px-1.5 text-[0.68rem] font-bold text-white">
                    {n.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>
        )}
      </header>

      <main className="min-h-0 flex-1 overflow-y-auto">
        <div
          className={`mx-auto flex min-h-full w-full flex-col px-4 py-4 ${width} ${wide ? "" : "pb-24"}`}
        >
          {children}
        </div>
      </main>

      {!wide && (
        <nav
          className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-surface/95 backdrop-blur"
          aria-label="Sections"
        >
          <div className={`mx-auto flex w-full ${width}`}>
            {nav.map((n) => (
              <button
                key={n.key}
                type="button"
                onClick={() => onNav(n.key)}
                aria-current={active === n.key ? "page" : undefined}
                className={`relative flex flex-1 flex-col items-center gap-0.5 py-2.5 text-xs font-semibold ${
                  active === n.key ? "text-navy" : "text-muted"
                }`}
              >
                <Icon name={n.icon} />
                {n.label}
                {!!n.badge && (
                  <span className="absolute right-[28%] top-1.5 grid min-w-4 place-items-center rounded-full bg-interest px-1 text-[0.65rem] font-bold text-white">
                    {n.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </nav>
      )}
    </div>
  );
}
