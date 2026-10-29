// Drop the official file at src/assets/cfci-logo.svg (or .png) and it replaces the placeholder.
const files = import.meta.glob("../assets/cfci-logo.*", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;

const src = Object.values(files)[0];

export function Logo({ className = "h-12" }: { className?: string }) {
  if (src)
    return <img src={src} alt="CFCI" className={`w-auto ${className}`} />;
  return (
    <span
      role="img"
      aria-label="CFCI"
      className="grid h-10 place-items-center rounded-xl bg-navy px-3 font-display text-sm font-bold tracking-wider text-white"
    >
      CFCI
    </span>
  );
}
