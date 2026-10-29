import { useEffect, type ReactNode } from "react";

// One compact row. Where it appears is up to the caller.
export function Toast({
  onDismiss,
  children,
}: {
  onDismiss: () => void;
  children: ReactNode;
}) {
  useEffect(() => {
    const t = window.setTimeout(onDismiss, 7000);
    return () => window.clearTimeout(t);
  }, [onDismiss]);
  return (
    <div
      role="status"
      className="anim-fade flex min-h-14 w-full max-w-md items-center gap-3 rounded-full bg-navy px-5 py-2 text-sm text-white shadow-xl"
    >
      {children}
    </div>
  );
}
