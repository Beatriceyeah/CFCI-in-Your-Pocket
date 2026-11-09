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

const AVATAR_TINT = ["from-royal to-navy", "from-accent-purple to-navy", "from-navy to-royal"];

// One photo per builder. A placeholder silhouette until their own photo is uploaded.
export function PersonAvatar({ member, index = 0, className = "size-14" }: { member: TeamMember; index?: number; className?: string }) {
  if (member.photo) {
    return <img src={member.photo} alt={member.name} className={`shrink-0 rounded-2xl object-cover ${className}`} />;
  }
  return (
    <div
      className={`shrink-0 overflow-hidden rounded-2xl bg-gradient-to-br ${AVATAR_TINT[index % AVATAR_TINT.length]} ${className}`}
      role="img"
      aria-label={`${member.name} (photo placeholder)`}
    >
      <svg viewBox="0 0 100 100" className="size-full text-white" aria-hidden="true">
        <circle cx="50" cy="38" r="17" fill="currentColor" opacity="0.9" />
        <ellipse cx="50" cy="94" rx="32" ry="30" fill="currentColor" opacity="0.9" />
      </svg>
    </div>
  );
}
