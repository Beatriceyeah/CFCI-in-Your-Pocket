import { Icon } from "./Icon";

const COLORS = ["bg-interest", "bg-royal", "bg-accent-yellow", "bg-accent-purple", "bg-navy"];

// A short thank-you after someone submits feedback. Confetti is decorative and respects reduced motion.
export function Celebration({
  teamName,
  helped,
  onDone,
}: {
  teamName: string;
  helped: number;
  onDone: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-ink/50 px-6" role="dialog" aria-modal="true" aria-label="Thank you">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        {Array.from({ length: 36 }, (_, i) => (
          <span
            key={i}
            className={`confetti absolute top-0 h-3 w-2 rounded-sm ${COLORS[i % COLORS.length]}`}
            style={{
              left: `${(i * 37) % 100}%`,
              animationDelay: `${(i % 9) * 0.12}s`,
              animationDuration: `${2.4 + (i % 5) * 0.35}s`,
            }}
          />
        ))}
      </div>
      <div className="anim-fade relative flex w-full max-w-sm flex-col items-center gap-3 rounded-3xl bg-surface p-7 text-center shadow-2xl">
        <span className="grid size-16 place-items-center rounded-full bg-interest text-white">
          <Icon name="check" className="size-9" />
        </span>
        <h2 className="font-display text-3xl font-bold text-navy">Thank you!</h2>
        <p className="text-[1.02rem] leading-snug">
          You are helping the {teamName} team improve. Students read every word of what you shared.
        </p>
        <p className="rounded-full bg-interest/15 px-4 py-1.5 text-sm font-semibold text-interest-deep">
          {helped} {helped === 1 ? "team" : "teams"} helped so far
        </p>
        <button type="button" onClick={onDone} className="mt-1 rounded-full bg-navy px-7 py-2.5 font-semibold text-white">
          Keep helping teams
        </button>
      </div>
    </div>
  );
}
