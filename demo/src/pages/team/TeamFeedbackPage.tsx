import { useState, type ReactNode } from "react";
import { Chip, Pill } from "../../components/Pill";
import { RatingBar, ratingWord } from "../../components/RatingBar";
import { DIMENSIONS, REACTIONS } from "../../data/dimensions";
import { computeStats } from "../../lib/analytics";
import {
  feedbackItems,
  groupBy,
  type FeedbackField,
  type FeedbackItem,
} from "../../lib/feedback";
import { ownedProduct, useStore } from "../../store/StoreContext";
import type { FeedbackStatus } from "../../types";
import { NoProduct } from "./NoProduct";

type View = "giver" | "lens";

const VIEWS: { key: View; label: string }[] = [
  { key: "giver", label: "By giver" },
  { key: "lens", label: "By lens" },
];

const STATUS_LABEL: Record<FeedbackStatus, string> = {
  new: "New",
  noted: "Noted",
  planned: "Will address",
  not_now: "Not now",
};

const CHOICES: FeedbackStatus[] = ["noted", "planned", "not_now"];

const fieldLabel = (f: FeedbackField): string =>
  f === "general"
    ? "General"
    : (DIMENSIONS.find((d) => d.key === f)?.label ?? f);

/** One small control per comment instead of three buttons. */
function StatusControl({ itemKey }: { itemKey: string }) {
  const { state, dispatch } = useStore();
  const [open, setOpen] = useState(false);
  const status = state.feedbackStatus[itemKey] ?? "new";
  const choose = (next: FeedbackStatus) => {
    dispatch({ type: "set_feedback_status", evalId: itemKey, status: next });
    setOpen(false);
  };
  return (
    <div className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-1.5 text-xs font-semibold ${
          status === "new" ? "text-warn" : "text-muted"
        }`}
      >
        {status === "new" && <span className="size-1.5 rounded-full bg-warn" />}
        {STATUS_LABEL[status]} ▾
      </button>
      {open && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div
            role="menu"
            className="anim-fade absolute right-0 top-full z-20 mt-1 w-40 overflow-hidden rounded-xl bg-surface shadow-xl ring-1 ring-line"
          >
            {CHOICES.map((c) => (
              <button
                key={c}
                type="button"
                role="menuitem"
                onClick={() => choose(c)}
                className="block w-full px-4 py-2.5 text-left text-sm font-medium text-ink hover:bg-canvas"
              >
                {STATUS_LABEL[c]}
              </button>
            ))}
            {status !== "new" && (
              <button
                type="button"
                role="menuitem"
                onClick={() => choose("new")}
                className="block w-full border-t border-line px-4 py-2.5 text-left text-sm text-muted hover:bg-canvas"
              >
                Mark as new
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

const Score = ({ rating }: { rating?: number }) =>
  rating === undefined ? null : (
    <span className="shrink-0 text-sm font-semibold tabular-nums text-accent-purple">
      {rating}/5
    </span>
  );

/** Small blue tag for a lens. Lenses are always blue on white text, people are always plain text. */
const LensLabel = ({ field }: { field: FeedbackField }) => (
  <span className="rounded-full bg-navy px-2.5 py-0.5 text-xs font-semibold text-white">
    {fieldLabel(field)}
  </span>
);

const Person = ({ name, role }: { name: string; role: string }) => (
  <span className="min-w-0 truncate text-sm">
    <span className="font-semibold text-navy">{name}</span>
    <span className="text-muted"> · {role}</span>
  </span>
);

function CommentRow({
  item,
  lead,
  onUpdateFrom,
}: {
  item: FeedbackItem;
  lead: ReactNode;
  onUpdateFrom: (note: string) => void;
}) {
  const { state } = useStore();
  const status = state.feedbackStatus[item.key] ?? "new";
  return (
    <li className="flex flex-col gap-1 px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        {lead}
        <Score rating={item.rating} />
      </div>
      <p className="text-[0.95rem] leading-snug">{item.text}</p>
      <div className="mt-1 flex items-center justify-between gap-3 text-xs text-muted">
        <span>
          {new Date(item.at).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
          })}
        </span>
        <span className="flex items-center gap-4">
          {status === "planned" && (
            <button
              type="button"
              onClick={() =>
                onUpdateFrom(`Addressed feedback: ${item.text}`.slice(0, 140))
              }
              className="font-semibold text-royal"
            >
              Update product
            </button>
          )}
          <StatusControl itemKey={item.key} />
        </span>
      </div>
    </li>
  );
}

/** The heading sits on the page; the comments share one white card underneath. */
function Group({
  heading,
  meta,
  children,
}: {
  heading: ReactNode;
  meta: string;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-3 px-1">
        {heading}
        <span className="shrink-0 text-xs text-muted">{meta}</span>
      </div>
      <ul className="divide-y divide-line overflow-hidden rounded-2xl bg-surface ring-1 ring-line">
        {children}
      </ul>
    </section>
  );
}

export function TeamFeedbackPage({
  onUpdateFrom,
}: {
  onUpdateFrom: (note: string) => void;
}) {
  const { state } = useStore();
  const [view, setView] = useState<View>("giver");
  const product = ownedProduct(state);
  if (!product) return <NoProduct />;

  const stats = computeStats(product, {}, state.evaluations);
  const items = feedbackItems(stats.evaluations);
  const open = items.filter((i) => !state.feedbackStatus[i.key]).length;

  const renderList = () => {
    if (!items.length) {
      return (
        <p className="rounded-2xl bg-surface p-6 text-center text-muted ring-1 ring-line">
          No written comments yet.
        </p>
      );
    }
    const count = (n: number) => `${n} comment${n > 1 ? "s" : ""}`;
    if (view === "giver") {
      return groupBy(items, (i) => `${i.viewerName}|${i.viewerLabel}`).map(
        ([key, group]) => (
          <Group
            key={key}
            heading={
              <Person
                name={group[0]?.viewerName ?? ""}
                role={group[0]?.viewerLabel ?? ""}
              />
            }
            meta={count(group.length)}
          >
            {group.map((i) => (
              <CommentRow
                key={i.key}
                item={i}
                lead={<LensLabel field={i.field} />}
                onUpdateFrom={onUpdateFrom}
              />
            ))}
          </Group>
        ),
      );
    }
    const order: FeedbackField[] = [...DIMENSIONS.map((d) => d.key), "general"];
    const groups = groupBy(items, (i) => i.field);
    return order.flatMap((f) => {
      const group = groups.find(([k]) => k === f)?.[1];
      if (!group) return [];
      const avg = f === "general" ? undefined : stats.dimensionAvg[f];
      return [
        <Group
          key={f}
          heading={<LensLabel field={f} />}
          meta={`${avg ? `Avg ${avg.toFixed(1)} · ` : ""}${count(group.length)}`}
        >
          {group.map((i) => (
            <CommentRow
              key={i.key}
              item={i}
              lead={<Person name={i.viewerName} role={i.viewerLabel} />}
              onUpdateFrom={onUpdateFrom}
            />
          ))}
        </Group>,
      ];
    });
  };

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-display text-2xl font-bold text-navy">Feedback</h1>
        <p className="text-sm text-muted">
          From {stats.evaluations.length} evaluations. Each comment shows who
          gave it.
        </p>
      </div>

      <section
        className="flex flex-col gap-3 rounded-2xl bg-surface p-4 ring-1 ring-line"
        aria-label="Scores by lens"
      >
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-lg font-semibold text-navy">
            How viewers scored you
          </h2>
          <span className="font-display text-xl font-bold tabular-nums text-navy">
            {stats.overall ? stats.overall.toFixed(1) : "–"}
            <span className="text-sm font-medium text-muted"> / 5</span>
          </span>
        </div>
        <ul className="flex flex-col gap-3">
          {DIMENSIONS.map((d) => {
            const v = stats.dimensionAvg[d.key];
            return (
              <li key={d.key} className="flex flex-col gap-1">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{d.label}</span>
                  <span className="tabular-nums text-muted">
                    {v ? `${v.toFixed(1)} · ${ratingWord(v)}` : "No ratings"}
                  </span>
                </div>
                <RatingBar value={v} />
              </li>
            );
          })}
        </ul>
        <div className="grid grid-cols-3 gap-2 border-t border-line pt-3 text-center">
          {REACTIONS.map((r) => (
            <div key={r.key}>
              <p className="font-display text-2xl font-bold tabular-nums text-navy">
                {stats.reactions[r.key]}
              </p>
              <p className="text-xs text-muted">{r.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-navy">
            All comments
          </h2>
          <Pill tone={open ? "warn" : "good"}>{open} new</Pill>
        </div>
        <div className="flex gap-2" role="group" aria-label="View comments">
          {VIEWS.map((v) => (
            <Chip
              key={v.key}
              active={view === v.key}
              onClick={() => setView(v.key)}
            >
              {v.label}
            </Chip>
          ))}
        </div>
        <div className="flex flex-col gap-5">{renderList()}</div>
      </section>
    </div>
  );
}
