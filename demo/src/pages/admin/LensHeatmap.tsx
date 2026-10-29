import { Pill } from "../../components/Pill";
import { DIMENSIONS } from "../../data/dimensions";
import { computeStats } from "../../lib/analytics";
import { useStore } from "../../store/StoreContext";

const tint = (v: number | null): string =>
  v === null
    ? "bg-canvas text-muted"
    : v >= 4
      ? "bg-royal text-white"
      : v >= 3.2
        ? "bg-royal/45 text-ink"
        : v >= 2.4
          ? "bg-royal/15 text-ink"
          : "bg-warn-soft text-warn";

export function LensHeatmap() {
  const { state } = useStore();
  const rows = state.products
    .filter((p) => p.status === "live")
    .map((p) => ({ p, s: computeStats(p, state.swipes, state.evaluations) }))
    .sort((a, b) => (b.s.overall ?? 0) - (a.s.overall ?? 0));

  return (
    <details className="group rounded-2xl bg-surface p-5 ring-1 ring-line" aria-label="Scores by business lens">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
        <span>
          <span className="block font-display text-xl font-semibold text-navy">Scores by business lens</span>
          <span className="block text-sm text-muted">Average score from 1 to 5, by product and lens</span>
        </span>
        <span className="text-sm font-semibold text-royal group-open:hidden">Show</span>
        <span className="hidden text-sm font-semibold text-royal group-open:inline">Hide</span>
      </summary>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[38rem] text-center text-sm">
          <thead className="text-xs uppercase tracking-wider text-muted">
            <tr>
              <th className="py-2 pr-3 text-left">Product</th>
              {DIMENSIONS.map((d) => (
                <th key={d.key} className="px-1 py-2">
                  {d.label}
                </th>
              ))}
              <th className="px-1 py-2">Overall</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ p, s }) => (
              <tr key={p.id} className="border-t border-line">
                <td className="py-1.5 pr-3 text-left font-medium">{p.name}</td>
                {DIMENSIONS.map((d) => {
                  const v = s.dimensionAvg[d.key];
                  return (
                    <td key={d.key} className="p-1">
                      <div className={`rounded-lg py-2 font-semibold tabular-nums ${tint(v)}`}>
                        {v ? v.toFixed(1) : "–"}
                      </div>
                    </td>
                  );
                })}
                <td className="p-1 font-display font-bold tabular-nums text-navy">
                  {s.overall ? s.overall.toFixed(1) : "–"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted">
        <Pill tone="navy">4.0 and up: strong</Pill>
        <Pill tone="warn">under 2.4: weak</Pill>
      </p>
    </details>
  );
}
