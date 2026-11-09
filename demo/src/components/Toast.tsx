import { useEffect, type ReactNode } from "react";

// One compact row. By default it sits wherever the caller puts it; `center` floats it mid-screen so it is never missed.
export function Toast({
  onDismiss,
  children,
  center = false,
  seconds = 7,
}: {
  onDismiss: () => void;
  children: ReactNode;
  center?: boolean;
  seconds?: number;
}) {
  useEffect(() => {
    const t = window.setTimeout(onDismiss, seconds * 1000);
    return () => window.clearTimeout(t);
  }, [onDismiss, seconds]);
  if (center) {
    return (
      <div className="pointer-events-none fixed inset-0 z-50 grid place-items-center px-6">
        <div
          role="status"
          className="anim-fade pointer-events-auto flex w-full max-w-xs flex-col items-center gap-3 rounded-3xl bg-navy p-6 text-center text-white shadow-2xl"
        >
          {children}
        </div>
      </div>
    );
  }
  return (
    <div
      role="status"
      className="anim-fade flex min-h-14 w-full max-w-md items-center gap-3 rounded-full bg-navy px-5 py-2 text-sm text-white shadow-xl"
    >
      {children}
    </div>
  );
}
