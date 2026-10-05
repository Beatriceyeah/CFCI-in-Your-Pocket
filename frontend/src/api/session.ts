// Keeps the sign-in token across page reloads. Storage can be unavailable (private mode),
// so every access is guarded and the app still works for the current tab.
import { setAccessToken } from "./client";

const TOKEN_KEY = "cfci.access_token";

export function loadToken(): string | null {
  let token: string | null = null;
  try {
    token = window.localStorage.getItem(TOKEN_KEY);
  } catch {
    token = null;
  }
  setAccessToken(token);
  return token;
}

export function saveToken(token: string): void {
  setAccessToken(token);
  try {
    window.localStorage.setItem(TOKEN_KEY, token);
  } catch {
    // Not persisted; the session still lasts for this tab.
  }
}

export function clearToken(): void {
  setAccessToken(null);
  try {
    window.localStorage.removeItem(TOKEN_KEY);
  } catch {
    // Nothing stored to clear.
  }
}
