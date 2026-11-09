import { useMemo, useState } from "react";
import { SEED_UNIQUE_VIEWERS } from "../../data/seed";
import { averageOf, computeStats, isDelisted, isListed, isStale, type ProductStats } from "../../lib/analytics";
import { useStore } from "../../store/StoreContext";
import { LensHeatmap } from "./LensHeatmap";

type SortKey = "views" | "interest" | "score" | "comments" | "engagement";

const COLUMNS: { key: SortKey; label: string }[] = [
  { key: "views", label: "Views" },
  { key: "interest", label: "Review-later rate" },
  { key: "score", label: "Avg score" },
  { key: "comments", label: "Comments" },
  { key: "engagement", label: "Engagement" },
];

const sortValue = (s: ProductStats, k: SortKey): number =>
  k === "interest"
    ? s.interestRate
    : k === "score"
      ? (s.overall ?? 0)
      : k === "comments"
        ? s.comments
        : k === "engagement"
          ? s.engagement
          : s.views;

const pct = (n: number): string => `${Math.round(n * 100)}%`;

export function AdminOverview({ onGoPortfolio }: { onGoPortfolio: () => void }) {
  const { state } = useStore();
  const [sort, setSort] = useState<SortKey>("engagement");

  const rows = useMemo(() => {
    const live = state.products.filter(isListed);
    return live
      .map((p) => ({ p, s: computeStats(p, state.swipes, state.evaluations, state.opens, state.connections) }))
      .sort((a, b) => sortValue(b.s, sort) - sortValue(a.s, sort));
  }, [state.products, state.swipes, state.evaluations, state.opens, state.connections, sort]);

  const totalViews = rows.reduce((n, r) => n + r.s.views, 0);
  const totalShown = rows.reduce((n, r) => n + r.s.shown, 0);
  const totalInterested = rows.reduce((n, r) => n + r.s.interested, 0);
  const totalEvals = rows.reduce((n, r) => n + r.s.evaluations.length, 0);
  const totalComments = rows.reduce((n, r) => n + r.s.comments, 0);
  const totalPartial = rows.reduce((n, r) => n + r.s.partial, 0);
  const totalEngagement = rows.reduce((n, r) => n + r.s.engagement, 0);
  const avgScore = averageOf(rows.map((r) => r.s.overall).filter((v): v is number => v !== null));
  const users = SEED_UNIQUE_VIEWERS + (Object.keys(state.swipes).length ? 1 : 0);
  const drafts = state.products.filter((p) => p.status === "draft").length;
  const stale = state.products.filter(isStale).length;
  const delisted = state.products.filter(isDelisted).length;
  const intros = state.connections.filter((c) => c.status === "pending").length;
  const attention = [
    drafts && `${drafts} draft${drafts > 1 ? "s" : ""}`,
    stale && `${stale} not updated in 30+ days`,
    delisted && `${delisted} delisted after 60 days`,
    intros && `${intros} introduction${intros > 1 ? "s" : ""} waiting`,
  ].filter(Boolean);

  const totals = [
    { label: "External users", value: users.toString() },
    { label: "Views", value: totalViews.toString() },
    { label: "Review-later rate", value: totalShown ? pct(totalInterested / totalShown) : "–" },
    { label: "Avg score", value: avgScore ? avgScore.toFixed(1) : "–" },
  ];

  const feedbackRate = totalViews ? Math.min(1, totalEvals / totalViews) : 0;
  const success = [
    { label: "Feedback rate", value: pct(feedbackRate), note: "Viewers who gave a rating or comment" },
    { label: "Written comments", value: totalComments.toString(), note: `${totalEvals} evaluations, ${totalPartial} partly done` },
    { label: "Engagement score", value: totalEngagement.toLocaleString(), note: "All activity, deeper steps count double" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-3xl font-bold text-navy">Dashboard</h1>

      {attention.length > 0 && (
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl bg-warn-soft px-4 py-3 text-sm text-warn">
          <span className="font-semibold">Needs attention:</span>
          {attention.join(" · ")}
          <button type="button" onClick={onGoPortfolio} className="font-semibold underline">
            Open portfolio
          </button>
        </p>
      )}

      <section aria-label="Are people giving feedback" className="flex flex-col gap-2">
        <h2 className="font-display text-xl font-semibold text-navy">Are people giving feedback?</h2>
        <dl className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {success.map((t) => (
            <div key={t.label} className="rounded-2xl bg-interest/10 p-4 ring-1 ring-interest/30">
              <dd className="font-display text-3xl font-bold tabular-nums text-interest-deep">{t.value}</dd>
              <dt className="text-sm font-semibold text-navy">{t.label}</dt>
              <p className="text-xs text-muted">{t.note}</p>
            </div>
          ))}
        </dl>
      </section>

      <dl className="grid grid-cols-2 gap-x-6 gap-y-4 rounded-2xl bg-surface p-5 ring-1 ring-line sm:grid-cols-4">
        {totals.map((t) => (
          <div key={t.label}>
            <dd className="font-display text-3xl font-bold tabular-nums text-navy">{t.value}</dd>
            <dt className="text-sm text-muted">{t.label}</dt>
          </div>
        ))}
      </dl>

      <section className="flex flex-col gap-3" aria-label="Product ranking">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="font-display text-xl font-semibold text-navy">Products</h2>
          <p className="text-xs text-muted">Tap a column to rank by it</p>
        </div>
        <div className="overflow-x-auto rounded-2xl bg-surface ring-1 ring-line">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-wider text-muted">
                <th className="px-4 py-3 font-semibold">Product</th>
                {COLUMNS.map((c) => (
                  <th key={c.key} className="px-3 py-3 text-right font-semibold">
                    <button
                      type="button"
                      onClick={() => setSort(c.key)}
                      aria-pressed={sort === c.key}
                      className={`uppercase tracking-wider ${sort === c.key ? "text-navy" : "text-muted"}`}
                    >
                      {c.label}
                      {sort === c.key ? " ↓" : ""}
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map(({ p, s }) => {
                const bold = (k: SortKey) => (sort === k ? "font-semibold" : "");
                return (
                  <tr key={p.id} className="border-t border-line align-top">
                    <td className="px-4 py-3 font-semibold text-navy">{p.name}</td>
                    <td className={`px-3 py-3 text-right tabular-nums ${bold("views")}`}>{s.views}</td>
                    <td className={`px-3 py-3 text-right tabular-nums ${bold("interest")}`}>
                      {pct(s.interestRate)}
                      {s.versions && (
                        <span className="block whitespace-nowrap text-xs font-normal text-muted">
                          {pct(s.versions.before)} → {pct(s.versions.after)} after update
                        </span>
                      )}
                    </td>
                    <td className={`px-3 py-3 text-right tabular-nums ${bold("score")}`}>
                      {s.overall ? s.overall.toFixed(1) : "–"}
                    </td>
                    <td className={`px-3 py-3 text-right tabular-nums ${bold("comments")}`}>{s.comments}</td>
                    <td className={`px-3 py-3 text-right tabular-nums ${bold("engagement")}`}>{s.engagement}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-muted">
          Views are overview opens. Review-later rate is the share of shown products marked Review later; for updated listings
          it is also split before and after the latest update. Engagement score: a view or an interest counts 1; a rating,
          a written comment or an introduction request counts 2.
        </p>
      </section>

      <LensHeatmap />
    </div>
  );
}
