import { useState } from "react";
import { DIRECTIONS } from "../data/dimensions";
import { useStore } from "../store/StoreContext";
import type { Direction } from "../types";

export function ExternalOnboarding() {
  const { state, dispatch } = useStore();
  const [picked, setPicked] = useState<Direction[]>(state.directions);

  const finish = (directions: Direction[]) => {
    dispatch({ type: "set_directions", directions });
    dispatch({ type: "finish_onboarding" });
  };

  return (
    <div className="mx-auto flex min-h-full w-full max-w-md flex-col justify-center gap-6 px-5 py-10">
      <header className="flex flex-col gap-2">
        <h1 className="font-display text-3xl font-bold text-navy">What do you follow?</h1>
        <p className="text-muted">
          We will rank these first. You can still browse everything else.
        </p>
      </header>
      <div className="grid grid-cols-2 gap-3">
        {DIRECTIONS.map((d) => {
          const on = picked.includes(d.key);
          return (
            <button
              key={d.key}
              type="button"
              aria-pressed={on}
              onClick={() => setPicked((p) => (on ? p.filter((x) => x !== d.key) : [...p, d.key]))}
              className={`flex flex-col gap-1 rounded-2xl p-4 text-left ring-1 ring-inset ${
                on ? "bg-navy text-white ring-navy" : "bg-surface ring-line"
              }`}
            >
              <span className="font-display font-semibold">{d.label}</span>
              <span className={`text-sm ${on ? "text-white/70" : "text-muted"}`}>{d.blurb}</span>
            </button>
          );
        })}
      </div>
      <div className="flex items-center gap-3">
        <button type="button" onClick={() => finish(picked)} className="rounded-full bg-navy px-6 py-2.5 font-semibold text-white">
          Start browsing
        </button>
        <button type="button" onClick={() => finish([])} className="px-3 py-2 font-medium text-muted">
          Skip
        </button>
      </div>
    </div>
  );
}
