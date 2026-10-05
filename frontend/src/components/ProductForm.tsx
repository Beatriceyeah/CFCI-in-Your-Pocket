import { useState } from "react";
import type { FormEvent } from "react";
import type { Direction, ProductCreate } from "../api/types";
import { DIRECTIONS, DIRECTION_LABELS } from "../lib/constants";

interface ProductFormProps {
  initial?: Partial<ProductCreate>;
  submitLabel: string;
  busy: boolean;
  error: string | null;
  onSubmit: (payload: ProductCreate) => void;
  onCancel?: () => void;
}

const EMPTY: ProductCreate = {
  name: "",
  one_liner: "",
  cover_image_url: "",
  demo_video_url: "",
  brief: "",
  category: "software",
};

export function ProductForm({
  initial,
  submitLabel,
  busy,
  error,
  onSubmit,
  onCancel,
}: ProductFormProps) {
  const [form, setForm] = useState<ProductCreate>({ ...EMPTY, ...initial });

  function set<K extends keyof ProductCreate>(key: K, value: ProductCreate[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    onSubmit(form);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-ink font-medium">Product name</span>
        <input
          required
          maxLength={100}
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
          className="rounded-card border-muted/30 focus:border-royal border px-3 py-2 outline-none"
          placeholder="Loom"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="text-ink font-medium">One-sentence intro</span>
        <input
          required
          maxLength={160}
          value={form.one_liner}
          onChange={(e) => set("one_liner", e.target.value)}
          className="rounded-card border-muted/30 focus:border-royal border px-3 py-2 outline-none"
          placeholder="Clinical trial matching in minutes"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="text-ink font-medium">Category</span>
        <select
          value={form.category}
          onChange={(e) => set("category", e.target.value as Direction)}
          className="rounded-card border-muted/30 focus:border-royal border px-3 py-2 outline-none"
        >
          {DIRECTIONS.map((d) => (
            <option key={d} value={d}>
              {DIRECTION_LABELS[d]}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="text-ink font-medium">Cover image URL</span>
        <input
          required
          type="url"
          value={form.cover_image_url}
          onChange={(e) => set("cover_image_url", e.target.value)}
          className="rounded-card border-muted/30 focus:border-royal border px-3 py-2 outline-none"
          placeholder="https://..."
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="text-ink font-medium">Demo video URL</span>
        <input
          required
          type="url"
          value={form.demo_video_url}
          onChange={(e) => set("demo_video_url", e.target.value)}
          className="rounded-card border-muted/30 focus:border-royal border px-3 py-2 outline-none"
          placeholder="https://..."
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="text-ink font-medium">Product brief</span>
        <textarea
          required
          maxLength={5000}
          rows={5}
          value={form.brief}
          onChange={(e) => set("brief", e.target.value)}
          className="rounded-card border-muted/30 focus:border-royal border px-3 py-2 outline-none"
          placeholder="What it does, who it's for, and why it matters."
        />
      </label>

      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={busy}
          className="bg-navy rounded-card flex-1 px-4 py-2 font-semibold text-white disabled:opacity-60"
        >
          {busy ? "Saving…" : submitLabel}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="text-muted rounded-card border-muted/30 border px-4 py-2 font-medium"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
