import { useEffect, useState } from "react";
import { ApiError, api } from "../api/client";

type Status = "checking" | "ok" | "down";

// Placeholder until Module 5 builds the real screens. Proves the API client end to end.
export function HomePage() {
  const [status, setStatus] = useState<Status>("checking");
  const [message, setMessage] = useState("");

  useEffect(() => {
    api
      .health()
      .then(() => setStatus("ok"))
      .catch((error: unknown) => {
        setStatus("down");
        setMessage(error instanceof ApiError ? error.message : "Unexpected error");
      });
  }, []);

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-4 px-4">
      <h1 className="text-navy text-3xl font-bold tracking-tight">CFCI in Your Pocket</h1>
      <p className="text-muted">Duke student products, one card at a time.</p>
      <p role="status" className="bg-surface rounded-card p-4 text-sm shadow-sm">
        {status === "checking" && "Checking API…"}
        {status === "ok" && "API connected."}
        {status === "down" && `API unavailable: ${message}`}
      </p>
    </main>
  );
}
