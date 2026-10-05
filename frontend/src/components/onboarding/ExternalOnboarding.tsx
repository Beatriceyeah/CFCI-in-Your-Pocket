import { useState } from "react";
import { ApiError, api } from "../../api/client";
import type { Direction } from "../../api/types";
import { useAuth } from "../../context/AuthContext";
import { CategoryChip } from "../CategoryChip";
import { DIRECTIONS } from "../../lib/constants";

export function ExternalOnboarding() {
  const { updateUser } = useAuth();
  const [selected, setSelected] = useState<Direction[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggle(direction: Direction) {
    setSelected((prev) =>
      prev.includes(direction) ? prev.filter((d) => d !== direction) : [...prev, direction],
    );
  }

  async function save(directions: Direction[]) {
    setBusy(true);
    setError(null);
    try {
      const user = await api.me.update({ interested_directions: directions, onboarded: true });
      updateUser(user);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't save your preferences right now.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-6 px-6">
      <div className="space-y-1 text-center">
        <h1 className="text-navy text-2xl font-bold">What are you into?</h1>
        <p className="text-muted text-sm">
          Pick a few directions to set your default gallery filter. You can always browse
          everything.
        </p>
      </div>

      <div className="bg-surface rounded-card space-y-5 p-5 shadow-sm">
        <div className="flex flex-wrap justify-center gap-2">
          {DIRECTIONS.map((direction) => (
            <CategoryChip
              key={direction}
              category={direction}
              selected={selected.includes(direction)}
              onClick={() => toggle(direction)}
            />
          ))}
        </div>

        {error && (
          <p role="alert" className="text-center text-sm text-red-600">
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={() => void save(selected)}
          disabled={busy}
          className="bg-navy rounded-card w-full px-4 py-2 font-semibold text-white disabled:opacity-60"
        >
          {busy ? "Saving…" : "Continue"}
        </button>
      </div>

      <button
        type="button"
        onClick={() => void save([])}
        disabled={busy}
        className="text-muted mx-auto text-sm underline disabled:opacity-60"
      >
        Skip for now
      </button>
    </main>
  );
}
