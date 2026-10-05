import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import type { AuthProvider } from "../api/types";

const BUTTONS: { provider: AuthProvider; label: string; hint: string }[] = [
  {
    provider: "duke_netid",
    label: "Sign in with Duke NetID",
    hint: "Listing a product as a Duke student",
  },
  { provider: "linkedin", label: "Sign in with LinkedIn", hint: "Browsing as an alum or investor" },
  { provider: "google", label: "Sign in with Google", hint: "Browsing as an alum or investor" },
];

export function LoginScreen() {
  const { login, error } = useAuth();
  const [pending, setPending] = useState<AuthProvider | null>(null);

  async function handleLogin(provider: AuthProvider) {
    setPending(provider);
    await login(provider);
    setPending(null);
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-6 px-6">
      <div className="space-y-2 text-center">
        <h1 className="text-navy text-3xl font-bold tracking-tight">CFCI in Your Pocket</h1>
        <p className="text-muted text-sm">Duke student products, one card at a time.</p>
      </div>

      <div className="bg-surface rounded-card space-y-3 p-5 shadow-sm">
        <p className="text-muted text-sm">
          Duke students listing a product sign in with Duke NetID. Alumni, investors and other
          visitors sign in with LinkedIn or Google.
        </p>
        <div className="flex flex-col gap-3">
          {BUTTONS.map(({ provider, label, hint }) => (
            <button
              key={provider}
              type="button"
              onClick={() => void handleLogin(provider)}
              disabled={pending !== null}
              className="bg-navy rounded-card flex flex-col gap-0.5 px-4 py-3 text-left text-white shadow-sm transition disabled:opacity-60"
            >
              <span className="font-semibold">{pending === provider ? "Signing in…" : label}</span>
              <span className="text-xs text-white/70">{hint}</span>
            </button>
          ))}
        </div>
        {error && (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        )}
      </div>
    </main>
  );
}
