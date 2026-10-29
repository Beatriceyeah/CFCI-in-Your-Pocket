import { useState } from "react";
import { CardPreview } from "../components/CardPreview";
import { Logo } from "../components/Logo";
import { useStore } from "../store/StoreContext";
import type { Persona, Provider } from "../types";

type Role = "investor" | "student" | "staff";

interface RoleOption {
  key: Role;
  label: string;
  line: string;
  persona: Persona;
  signIns: { label: string; provider: Provider }[];
}

const ROLES: RoleOption[] = [
  {
    key: "investor",
    label: "Investor or alum",
    line: "Browse ventures, share your take, ask for introductions.",
    persona: "external",
    signIns: [
      { label: "Continue with LinkedIn", provider: "linkedin" },
      { label: "Continue with Google", provider: "google" },
    ],
  },
  {
    key: "student",
    label: "Student team",
    line: "Update your product and read what people think.",
    persona: "team",
    signIns: [{ label: "Continue with Duke NetID", provider: "duke_netid" }],
  },
  {
    key: "staff",
    label: "CFCI staff",
    line: "Upload projects, track engagement, make introductions.",
    persona: "admin",
    signIns: [{ label: "Continue with Duke NetID", provider: "duke_netid" }],
  },
];

export function LoginPage() {
  const { dispatch } = useStore();
  const [role, setRole] = useState<Role>("investor");
  const current = ROLES.find((r) => r.key === role) ?? ROLES[0]!;

  return (
    <div className="mx-auto flex min-h-full w-full max-w-md flex-col px-6">
      <div className="flex flex-1 flex-col justify-center gap-7 py-10">
        <div className="flex flex-col gap-3">
          <div className="flex items-stretch justify-between gap-4">
            <h1 className="font-display font-bold tracking-tight text-navy">
              <span className="block text-6xl leading-none">CFCI</span>{" "}
              <span className="block text-4xl leading-tight">
                in Your Pocket
              </span>
            </h1>
            {/* Spans from the cap height of "CFCI" to the baseline of "in Your Pocket". */}
            <div className="mt-[0.6rem] shrink-0 self-start">
              <Logo className="h-[5.27rem]" />
            </div>
          </div>
          <p className="text-xl font-medium leading-snug text-muted">
            See what Duke is building.
          </p>
        </div>
        <CardPreview />

        <main className="flex flex-col gap-6">
          <div
            className="grid grid-cols-3 gap-1 rounded-2xl bg-line/60 p-1"
            role="tablist"
            aria-label="I am a"
          >
            {ROLES.map((r) => (
              <button
                key={r.key}
                type="button"
                role="tab"
                aria-selected={role === r.key}
                onClick={() => setRole(r.key)}
                className={`rounded-xl px-2 py-3 text-sm font-semibold leading-tight transition ${
                  role === r.key
                    ? "bg-surface text-navy shadow-sm"
                    : "text-muted hover:text-ink"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          <div key={role} className="anim-fade flex flex-col gap-4">
            <p className="text-center text-[0.95rem] text-muted">
              {current.line}
            </p>
            <div className="flex flex-col gap-3">
              {current.signIns.map((s, i) => (
                <button
                  key={s.label}
                  type="button"
                  onClick={() =>
                    dispatch({
                      type: "login",
                      persona: current.persona,
                      provider: s.provider,
                      fresh: true,
                    })
                  }
                  className={`rounded-full px-6 py-4 text-base font-semibold transition ${
                    i === 0
                      ? "bg-navy text-white hover:bg-royal"
                      : "bg-surface text-navy ring-1 ring-line hover:ring-royal"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </main>
      </div>

      <footer className="pb-8 text-center text-xs leading-relaxed text-muted">
        <p>Christensen Center for Innovation, Duke University</p>
        <p>Demo with sample data. Sign-in is simulated.</p>
      </footer>
    </div>
  );
}
