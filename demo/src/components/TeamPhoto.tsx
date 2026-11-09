import group from "../assets/placeholder-group.jpg";
import mascot from "../assets/placeholder-mascot.jpg";
import portrait from "../assets/placeholder-portrait.jpg";
import { students } from "../lib/team";
import type { Product, TeamMember } from "../types";

const TINT: Record<string, string> = {
  health: "from-royal to-navy",
  software: "from-accent-purple to-navy",
  hardware: "from-navy to-royal",
};

// Shows the team's uploaded photo, or a placeholder with one silhouette per student until they upload one.
export function TeamPhoto({ product, className = "size-16" }: { product: Product; className?: string }) {
  const count = Math.min(3, Math.max(1, students(product).length));
  if (product.teamPhoto) {
    return (
      <img
        src={product.teamPhoto}
        alt={`${product.name} team`}
        className={`shrink-0 rounded-2xl object-cover ${className}`}
      />
    );
  }
  const xs = count === 1 ? [50] : count === 2 ? [35, 65] : [26, 50, 74];
  return (
    <div
      className={`shrink-0 overflow-hidden rounded-2xl bg-gradient-to-br ${TINT[product.category] ?? TINT.health} ${className}`}
      role="img"
      aria-label={`${product.name} team photo (placeholder)`}
    >
      <svg viewBox="0 0 100 100" className="size-full text-white" aria-hidden="true">
        {xs.map((x) => (
          <g key={x} opacity="0.9">
            <circle cx={x} cy={40} r={count === 1 ? 14 : 11} fill="currentColor" />
            <ellipse cx={x} cy={96} rx={count === 1 ? 26 : 17} ry={count === 1 ? 30 : 24} fill="currentColor" />
          </g>
        ))}
      </svg>
    </div>
  );
}

// Stand-in photos until builders upload their own. Each person always gets the same one (picked from their name).
const SAMPLE_PHOTOS = [group, portrait, mascot];

const sampleFor = (name: string): string => {
  let h = 0;
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return SAMPLE_PHOTOS[h % SAMPLE_PHOTOS.length] ?? group;
};

// One photo per builder: their own upload, or one of the sample photos for now.
export function PersonAvatar({ member, className = "size-14" }: { member: TeamMember; index?: number; className?: string }) {
  return (
    <img
      src={member.photo || sampleFor(member.name)}
      alt={member.photo ? member.name : `${member.name} (sample photo)`}
      className={`shrink-0 rounded-2xl bg-line object-cover ${className}`}
    />
  );
}
