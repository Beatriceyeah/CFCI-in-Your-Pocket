import { createContext, useContext, useEffect, useReducer, type Dispatch, type ReactNode } from "react";
import type { Product } from "../types";
import { initialState, reducer, type Action, type State } from "./reducer";

const STORAGE_KEY = "cfci-pocket-demo-v7";

function load(): State {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...initialState(), ...(JSON.parse(raw) as Partial<State>) };
  } catch {
    // Storage can be blocked; the demo still works without it.
  }
  return initialState();
}

interface StoreValue {
  state: State;
  dispatch: Dispatch<Action>;
}

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, load);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore write failures.
    }
  }, [state]);

  return <StoreContext.Provider value={{ state, dispatch }}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const value = useContext(StoreContext);
  if (!value) throw new Error("useStore must be used inside StoreProvider");
  return value;
}

/** The product this student belongs to, if any. CFCI staff create all listings. */
export function ownedProduct(state: State): Product | undefined {
  const userId = state.session?.userId;
  return state.products.find((p) => userId && p.ownerIds?.includes(userId));
}
