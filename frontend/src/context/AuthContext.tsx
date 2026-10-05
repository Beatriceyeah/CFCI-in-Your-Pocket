import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { ApiError, api, setAccessToken } from "../api/client";
import type { AuthProvider, User } from "../api/types";

const TOKEN_KEY = "cfci_access_token";

interface AuthContextValue {
  user: User | null;
  status: "loading" | "signed-out" | "signed-in";
  error: string | null;
  login: (provider: AuthProvider) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<"loading" | "signed-out" | "signed-in">("loading");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setStatus("signed-out");
      return;
    }
    setAccessToken(token);
    api.me
      .get()
      .then((me) => {
        setUser(me);
        setStatus("signed-in");
      })
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
        setAccessToken(null);
        setStatus("signed-out");
      });
  }, []);

  const login = useCallback(async (provider: AuthProvider) => {
    setError(null);
    try {
      const session = await api.auth.demoLogin({ provider });
      localStorage.setItem(TOKEN_KEY, session.access_token);
      setAccessToken(session.access_token);
      setUser(session.user);
      setStatus("signed-in");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to sign in right now.");
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setAccessToken(null);
    setUser(null);
    setStatus("signed-out");
  }, []);

  const updateUser = useCallback((next: User) => setUser(next), []);

  const value = useMemo(
    () => ({ user, status, error, login, logout, updateUser }),
    [user, status, error, login, logout, updateUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
