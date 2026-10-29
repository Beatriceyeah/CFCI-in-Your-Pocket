import { useState } from "react";
import { Chip } from "../../components/Pill";
import { Sheet } from "../../components/Sheet";
import { DIRECTIONS } from "../../data/dimensions";
import { REGISTERED_STUDENTS } from "../../data/users";
import { useStore } from "../../store/StoreContext";
import type { Direction, MarketStat, Product, Stage } from "../../types";

const STAGES: Stage[] = ["Early research", "Prototype", "Validating"];
const INPUT = "rounded-xl border border-line bg-surface px-3 py-2 text-[0.95rem]";

const lines = (s: string): string[] =>
  s
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

const slug = (name: string): string =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

function Field({ id, label, hint, children }: { id: string; label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-semibold text-navy">
        {label}
      </label>
      {children}
      {hint && <p className="text-xs text-muted">{hint}</p>}
    </div>
  );
}

const marketOf = (p: Product | undefined, label: string): MarketStat | undefined =>
  p?.market.find((m) => m.label === label);

interface Props {
  product?: Product;
  onClose: () => void;
}

// CFCI staff create and complete every listing. Saving publishes it under the signed-in staff member's name.
export function UploadProjectSheet({ product, onClose }: Props) {
  const { state, dispatch } = useStore();
  const [name, setName] = useState(product?.name ?? "");
  const [tagline, setTagline] = useState(product?.tagline ?? "");
  const [category, setCategory] = useState<Direction>(product?.category ?? "health");
  const [stage, setStage] = useState<Stage>(product?.stage ?? "Early research");
  const [ip, setIp] = useState(product?.ip ?? "");
  const [pitchProblem, setPitchProblem] = useState(product?.pitchProblem ?? "");
  const [pitchSolution, setPitchSolution] = useState(product?.pitchSolution ?? "");
  const [summary, setSummary] = useState(product?.summary ?? "");
  const [problems, setProblems] = useState(product?.problems.join("\n") ?? "");
  const [solution, setSolution] = useState(product?.solution.join("\n") ?? "");
  const [edge, setEdge] = useState(product?.edge.join("\n") ?? "");
  const [traction, setTraction] = useState(product?.traction.join("\n") ?? "");
  const [next, setNext] = useState(product?.next.join("\n") ?? "");
  const [tamValue, setTamValue] = useState(marketOf(product, "TAM")?.value ?? "");
  const [tamNote, setTamNote] = useState(marketOf(product, "TAM")?.note ?? "");
  const [samValue, setSamValue] = useState(marketOf(product, "SAM")?.value ?? "");
  const [samNote, setSamNote] = useState(marketOf(product, "SAM")?.note ?? "");
  const [team, setTeam] = useState(product?.team.map((t) => `${t.name}, ${t.role}`).join("\n") ?? "");
  const [owners, setOwners] = useState<string[]>(product?.ownerIds ?? []);
  const [cover, setCover] = useState("");
  const [video, setVideo] = useState("");
  const [tried, setTried] = useState(false);

  const missing = [name, tagline, pitchProblem, pitchSolution].some((v) => v.trim() === "");
  const title = !product ? "Upload project" : product.status === "draft" ? "Upload details" : "Edit listing";

  const save = () => {
    if (missing) {
      setTried(true);
      return;
    }
    const market: MarketStat[] = [
      ...(tamValue.trim() ? [{ label: "TAM", value: tamValue.trim(), note: tamNote.trim() }] : []),
      ...(samValue.trim() ? [{ label: "SAM", value: samValue.trim(), note: samNote.trim() }] : []),
      ...(product?.market.filter((m) => m.label !== "TAM" && m.label !== "SAM") ?? []),
    ];
    const members = lines(team).map((l) => {
      const [n, ...rest] = l.split(",");
      return { name: (n ?? "").trim(), role: rest.join(",").trim() || "Team member" };
    });
    for (const id of owners) {
      const u = REGISTERED_STUDENTS.find((x) => x.id === id);
      if (u && !members.some((m) => m.name === u.name)) members.push({ name: u.name, role: "Team member" });
    }
    const id = product?.id ?? `${slug(name)}-${Date.now().toString(36)}`;
    dispatch({
      type: "upload_product",
      product: {
        id,
        name: name.trim(),
        tagline: tagline.trim(),
        pitchProblem: pitchProblem.trim(),
        pitchSolution: pitchSolution.trim(),
        category,
        stage,
        ip: ip.trim() || "Not yet disclosed",
        summary: summary.trim(),
        problems: lines(problems),
        solution: lines(solution),
        edge: lines(edge),
        market,
        traction: lines(traction),
        next: lines(next),
        team: members,
        ownerIds: owners,
        daysSinceUpdate: 0,
        status: "live",
      },
    });
    onClose();
  };

  return (
    <Sheet
      title={title}
      onClose={onClose}
      footer={
        <div className="flex items-center gap-3">
          <p className="flex-1 text-sm text-muted">
            {tried && missing ? "Fill in the highlighted fields." : `Saves as ${state.session?.name ?? "you"}.`}
          </p>
          <button type="button" onClick={save} className="rounded-full bg-navy px-6 py-2.5 font-semibold text-white">
            {product ? "Save and publish" : "Upload and publish"}
          </button>
        </div>
      }
    >
      <div className="flex flex-col gap-4 p-5">
        <p className="text-sm text-muted">
          Publishing makes this listing live in Browse and records you as the staff member who uploaded it.
        </p>
        <Field id="up-name" label="Product name">
          <input id="up-name" className={`${INPUT} ${tried && !name.trim() ? "ring-2 ring-royal" : ""}`} value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <Field id="up-tagline" label="Tagline">
          <input id="up-tagline" className={`${INPUT} ${tried && !tagline.trim() ? "ring-2 ring-royal" : ""}`} value={tagline} onChange={(e) => setTagline(e.target.value)} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field id="up-category" label="Direction">
            <select id="up-category" className={INPUT} value={category} onChange={(e) => setCategory(e.target.value as Direction)}>
              {DIRECTIONS.map((d) => (
                <option key={d.key} value={d.key}>
                  {d.label}
                </option>
              ))}
            </select>
          </Field>
          <Field id="up-stage" label="Stage">
            <select id="up-stage" className={INPUT} value={stage} onChange={(e) => setStage(e.target.value as Stage)}>
              {STAGES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </Field>
        </div>
        <Field id="up-pitch-problem" label="The problem, in one sentence" hint="First line on the browse card.">
          <textarea id="up-pitch-problem" rows={2} className={`${INPUT} ${tried && !pitchProblem.trim() ? "ring-2 ring-royal" : ""}`} value={pitchProblem} onChange={(e) => setPitchProblem(e.target.value)} />
        </Field>
        <Field id="up-pitch-solution" label="The solution, in one sentence" hint="Second line on the browse card.">
          <textarea id="up-pitch-solution" rows={2} className={`${INPUT} ${tried && !pitchSolution.trim() ? "ring-2 ring-royal" : ""}`} value={pitchSolution} onChange={(e) => setPitchSolution(e.target.value)} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field id="up-cover" label="Cover image">
            <label htmlFor="up-cover" className="cursor-pointer rounded-xl border border-dashed border-royal px-3 py-2 text-center text-sm text-royal">
              {cover || "Choose file"}
              <input id="up-cover" type="file" accept="image/*" className="sr-only" onChange={(e) => setCover(e.target.files?.[0]?.name ?? "")} />
            </label>
          </Field>
          <Field id="up-video" label="Demo video">
            <label htmlFor="up-video" className="cursor-pointer rounded-xl border border-dashed border-royal px-3 py-2 text-center text-sm text-royal">
              {video || "Choose file"}
              <input id="up-video" type="file" accept="video/*" className="sr-only" onChange={(e) => setVideo(e.target.files?.[0]?.name ?? "")} />
            </label>
          </Field>
        </div>
        <Field id="up-summary" label="Overview paragraph">
          <textarea id="up-summary" rows={3} className={INPUT} value={summary} onChange={(e) => setSummary(e.target.value)} />
        </Field>
        <Field id="up-problems" label="Problem points" hint="One per line.">
          <textarea id="up-problems" rows={3} className={INPUT} value={problems} onChange={(e) => setProblems(e.target.value)} />
        </Field>
        <Field id="up-solution" label="Solution points" hint="One per line.">
          <textarea id="up-solution" rows={3} className={INPUT} value={solution} onChange={(e) => setSolution(e.target.value)} />
        </Field>
        <Field id="up-edge" label="Why it wins" hint="One per line.">
          <textarea id="up-edge" rows={3} className={INPUT} value={edge} onChange={(e) => setEdge(e.target.value)} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field id="up-tam" label="Market size (TAM)">
            <input id="up-tam" className={INPUT} value={tamValue} onChange={(e) => setTamValue(e.target.value)} placeholder="$6.2B/yr" />
          </Field>
          <Field id="up-tam-note" label="TAM covers">
            <input id="up-tam-note" className={INPUT} value={tamNote} onChange={(e) => setTamNote(e.target.value)} placeholder="US sleep-aid market" />
          </Field>
          <Field id="up-sam" label="Reachable market (SAM)">
            <input id="up-sam" className={INPUT} value={samValue} onChange={(e) => setSamValue(e.target.value)} placeholder="$150M/yr" />
          </Field>
          <Field id="up-sam-note" label="SAM covers">
            <input id="up-sam-note" className={INPUT} value={samNote} onChange={(e) => setSamNote(e.target.value)} placeholder="Nursing home patients" />
          </Field>
        </div>
        <Field id="up-ip" label="IP position">
          <input id="up-ip" className={INPUT} value={ip} onChange={(e) => setIp(e.target.value)} placeholder="Provisional patent filed" />
        </Field>
        <Field id="up-traction" label="Traction so far" hint="One per line.">
          <textarea id="up-traction" rows={3} className={INPUT} value={traction} onChange={(e) => setTraction(e.target.value)} />
        </Field>
        <Field id="up-next" label="What they work on next" hint="One per line.">
          <textarea id="up-next" rows={3} className={INPUT} value={next} onChange={(e) => setNext(e.target.value)} />
        </Field>
        <Field id="up-team" label="Team shown to investors" hint="One per line: name, year, major.">
          <textarea id="up-team" rows={3} className={INPUT} value={team} onChange={(e) => setTeam(e.target.value)} />
        </Field>
        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold text-navy">Student accounts that can manage this listing</p>
          <div className="flex flex-wrap gap-2">
            {REGISTERED_STUDENTS.map((u) => (
              <Chip
                key={u.id}
                active={owners.includes(u.id)}
                onClick={() => setOwners((o) => (o.includes(u.id) ? o.filter((x) => x !== u.id) : [...o, u.id]))}
              >
                {u.name}
              </Chip>
            ))}
          </div>
          <p className="text-xs text-muted">Linked students see this listing under My product.</p>
        </div>
      </div>
    </Sheet>
  );
}
