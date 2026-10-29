import { Chip, Pill } from "../components/Pill";
import { DIRECTIONS } from "../data/dimensions";
import { useStore } from "../store/StoreContext";
import { ConnectionsSection } from "./team/ConnectionsSection";
import type { Provider } from "../types";

const PROVIDER: Record<Provider, string> = {
  duke_netid: "Duke NetID",
  linkedin: "LinkedIn",
  google: "Google",
};

export function MePage() {
  const { state, dispatch } = useStore();
  const session = state.session;
  if (!session) return null;
  const liked = Object.values(state.swipes).filter((s) => s.direction === "right").length;

  return (
    <div className="flex flex-col gap-5">
      <h1 className="font-display text-2xl font-bold text-navy">My info</h1>
      <section className="flex flex-col gap-3 rounded-2xl bg-surface p-5 ring-1 ring-line">
        <div>
          <p className="font-display text-xl font-semibold text-navy">{session.name}</p>
          <p className="text-muted">{session.roleLabel}</p>
        </div>
        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wider text-muted">Signed in with</dt>
            <dd className="font-medium">{PROVIDER[session.provider]}</dd>
          </div>
          {session.persona === "team" && (
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wider text-muted">Email</dt>
              <dd className="break-all font-medium">{session.email}</dd>
            </div>
          )}
          {session.persona === "external" && (
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wider text-muted">Interested products</dt>
              <dd className="font-medium">{liked}</dd>
            </div>
          )}
        </dl>
      </section>

      {session.persona === "team" && <ConnectionsSection />}

      {session.persona === "external" && (
        <section className="flex flex-col gap-3 rounded-2xl bg-surface p-5 ring-1 ring-line">
          <h2 className="font-display text-lg font-semibold text-navy">My interests</h2>
          <div className="flex flex-wrap gap-2">
            {DIRECTIONS.map((d) => {
              const on = state.directions.includes(d.key);
              return (
                <Chip
                  key={d.key}
                  active={on}
                  onClick={() =>
                    dispatch({
                      type: "set_directions",
                      directions: on ? state.directions.filter((x) => x !== d.key) : [...state.directions, d.key],
                    })
                  }
                >
                  {d.label}
                </Chip>
              );
            })}
          </div>
          <p className="text-sm text-muted">Ventures in these areas are ranked first in Browse. Nothing is hidden.</p>
        </section>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={() => dispatch({ type: "logout" })} className="rounded-full px-5 py-2.5 font-semibold text-royal ring-1 ring-royal">
          Sign out
        </button>
        <button type="button" onClick={() => dispatch({ type: "reset" })} className="px-3 py-2 text-sm font-medium text-muted">
          Reset demo data
        </button>
        <Pill>Demo build</Pill>
      </div>
    </div>
  );
}
