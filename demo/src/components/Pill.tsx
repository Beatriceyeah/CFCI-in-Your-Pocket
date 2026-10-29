import type { ReactNode } from "react";

type Tone = "neutral" | "navy" | "good" | "warn" | "bad" | "purple";

const TONES: Record<Tone, string> = {
  neutral: "bg-canvas text-muted ring-line",
  navy: "bg-navy/8 text-navy ring-navy/15",
  good: "bg-interest/20 text-interest-deep ring-interest/40",
  warn: "bg-warn-soft text-warn ring-warn/20",
  bad: "bg-danger-soft text-danger ring-danger/20",
  purple: "bg-accent-purple/10 text-accent-purple ring-accent-purple/20",
};

export function Pill({ tone = "neutral", children }: { tone?: Tone; children: ReactNode }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${TONES[tone]}`}
    >
      {children}
    </span>
  );
}

export function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium ring-1 ring-inset transition ${
        active
          ? "bg-navy text-white ring-navy"
          : "bg-surface text-ink ring-line hover:ring-royal"
      }`}
    >
      {children}
    </button>
  );
}
