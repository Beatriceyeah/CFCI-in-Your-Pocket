import { useSyncExternalStore } from "react";
import type { Persona } from "../types";

// Each kind of user gets their own link: #/investor, #/student and #/staff.
export const PERSONA_HASH: Record<Persona, string> = { external: "investor", team: "student", admin: "staff" };

const read = (): Persona | null => {
  const key = window.location.hash.replace(/^#\/?/, "").split(/[/?]/)[0];
  return (Object.keys(PERSONA_HASH) as Persona[]).find((p) => PERSONA_HASH[p] === key) ?? null;
};

const subscribe = (cb: () => void): (() => void) => {
  window.addEventListener("hashchange", cb);
  return () => window.removeEventListener("hashchange", cb);
};

export const useHashPersona = (): Persona | null => useSyncExternalStore(subscribe, read, () => null);

export const setPersonaHash = (persona: Persona): void => {
  window.location.hash = `/${PERSONA_HASH[persona]}`;
};

/** Sets the link without adding a history entry. */
export const replacePersonaHash = (persona: Persona): void => {
  window.history.replaceState(null, "", `#/${PERSONA_HASH[persona]}`);
  window.dispatchEvent(new HashChangeEvent("hashchange"));
};
