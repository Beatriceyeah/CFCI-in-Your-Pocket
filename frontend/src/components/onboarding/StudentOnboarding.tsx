import { useState } from "react";
import { ApiError, api } from "../../api/client";
import type { ProductCreate } from "../../api/types";
import { useAuth } from "../../context/AuthContext";
import { ProductForm } from "../ProductForm";

export function StudentOnboarding() {
  const { updateUser } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function finishOnboarding() {
    const user = await api.me.update({ onboarded: true });
    updateUser(user);
  }

  async function handleSkip() {
    setBusy(true);
    try {
      await finishOnboarding();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't skip right now.");
    } finally {
      setBusy(false);
    }
  }

  async function handleSubmit(payload: ProductCreate) {
    setBusy(true);
    setError(null);
    try {
      await api.products.create(payload);
      await finishOnboarding();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't list your product right now.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col gap-4 px-6 py-10">
      <div className="space-y-1">
        <h1 className="text-navy text-2xl font-bold">List your product</h1>
        <p className="text-muted text-sm">
          Show CFCI, alumni and investors what you're building. You can edit this later from My
          Dashboard, or skip for now and upload another time.
        </p>
      </div>
      <div className="bg-surface rounded-card p-5 shadow-sm">
        <ProductForm
          submitLabel="List my product"
          busy={busy}
          error={error}
          onSubmit={handleSubmit}
        />
      </div>
      <button
        type="button"
        onClick={() => void handleSkip()}
        disabled={busy}
        className="text-muted mx-auto text-sm underline disabled:opacity-60"
      >
        Skip for now
      </button>
    </main>
  );
}
