import { useEffect, useState, type ReactNode } from "react";
import { Icon } from "./Icon";

const FADE_MS = 400;

/**
 * A small note that floats over the top of the page: it fades out by itself and can be closed. Callers place it; `seconds` can be raised while the person is still interacting with it.
 */
export function Toast({
  onDismiss,
  children,
  seconds = 6,
}: {
  onDismiss: () => void;
  children: ReactNode;
  seconds?: number;
}) {
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    setLeaving(false);
    const fade = window.setTimeout(() => setLeaving(true), Math.max(0, seconds * 1000 - FADE_MS));
    const end = window.setTimeout(onDismiss, seconds * 1000);
    return () => {
      window.clearTimeout(fade);
      window.clearTimeout(end);
    };
  }, [onDismiss, seconds]);

  return (
    <div
      role="status"
      style={{ transition: `opacity ${FADE_MS}ms ease-out, transform ${FADE_MS}ms ease-out` }}
      className={`anim-fade relative flex w-[22rem] max-w-full flex-col gap-2 overflow-hidden rounded-2xl bg-navy px-4 pb-4 pt-3.5 text-sm text-white shadow-xl ${
        leaving ? "-translate-y-1 opacity-0" : "opacity-100"
      }`}
    >
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Close"
        className="absolute right-2 top-2 grid size-7 place-items-center rounded-full text-white/70 hover:bg-white/10 hover:text-white"
      >
        <Icon name="close" className="size-4" />
      </button>
      {children}
    </div>
  );
}
