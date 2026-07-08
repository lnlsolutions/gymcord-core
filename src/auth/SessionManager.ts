import type { AuthSession } from "./types";

const SESSION_KEY = "gymcord.auth.session.v1";
const REFRESH_WINDOW_MS = 5 * 60 * 1000;

export class SessionManager {
  static load(): AuthSession | null {
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as AuthSession;
    } catch {
      this.clear();
      return null;
    }
  }

  static save(session: AuthSession): void {
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }

  static clear(): void {
    window.localStorage.removeItem(SESSION_KEY);
  }

  static isExpired(session: AuthSession): boolean {
    return new Date(session.tokens.expiresAt).getTime() <= Date.now();
  }

  static shouldRefresh(session: AuthSession): boolean {
    return new Date(session.tokens.expiresAt).getTime() - Date.now() <= REFRESH_WINDOW_MS;
  }
}
