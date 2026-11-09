import { CardPreview } from "../components/CardPreview";
import { Logo } from "../components/Logo";
import { useStore } from "../store/StoreContext";
import type { Persona, Provider } from "../types";

interface RoleOption {
  line: string;
  signIns: { label: string; provider: Provider }[];
}

// One login page per link. People never choose a role; the link they were given decides it.
const ROLES: Record<Persona, RoleOption> = {
  external: {
    line: "Browse Duke ventures, share your view to help the teams, ask for introductions.",
    signIns: [
      { label: "Continue with LinkedIn", provider: "linkedin" },
      { label: "Continue with Google", provider: "google" },
    ],
  },
  team: {
    line: "Update your product and read what people think.",
    signIns: [{ label: "Continue with Duke NetID", provider: "duke_netid" }],
  },
  admin: {
    line: "Upload projects, track engagement, make introductions.",
    signIns: [{ label: "Continue with Duke NetID", provider: "duke_netid" }],
  },
};

export function LoginPage({ persona }: { persona: Persona }) {
  const { dispatch } = useStore();
  const current = ROLES[persona];

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

        <main className="flex flex-col gap-4">
          <p className="text-center text-[0.95rem] text-muted">{current.line}</p>
          <div className="flex flex-col gap-3">
            {current.signIns.map((s, i) => (
              <button
                key={s.label}
                type="button"
                onClick={() =>
                  dispatch({ type: "login", persona, provider: s.provider })
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
          {persona === "team" && (
            <button
              type="button"
              onClick={() =>
                dispatch({ type: "login", persona, provider: "duke_netid", userId: "u-tom" })
              }
              className="text-center text-sm font-medium text-royal underline underline-offset-2"
            >
              Demo: sign in as a team whose listing is about to be delisted
            </button>
          )}
        </main>
      </div>

      <footer className="pb-8 text-center text-xs leading-relaxed text-muted">
        <p>Christensen Center for Innovation, Duke University</p>
        <p>Demo with sample data. Sign-in is simulated.</p>
      </footer>
    </div>
  );
}
