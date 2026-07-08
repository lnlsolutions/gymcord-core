import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Organization, User } from "../types/domain";
import { offlineEngine, type OfflineEngine } from "../services/sync";

export type AppTheme = "system" | "light" | "dark";

export interface AuthenticationState {
  authenticated: boolean;
  authenticating: boolean;
}

export interface NetworkState {
  online: boolean;
  lastChangedAt: string;
}

export interface AppContextValue {
  currentUser: User | null;
  organization: Organization | null;
  theme: AppTheme;
  offline: boolean;
  network: NetworkState;
  authentication: AuthenticationState;
  offlineEngine: OfflineEngine;
  setCurrentUser(user: User | null): void;
  setOrganization(organization: Organization | null): void;
  setTheme(theme: AppTheme): void;
  setOffline(offline: boolean): void;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppContextProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [theme, setTheme] = useState<AppTheme>("system");
  const [offline, setOffline] = useState(() => typeof navigator !== "undefined" ? !navigator.onLine : false);
  const [network, setNetwork] = useState<NetworkState>({ online: !offline, lastChangedAt: new Date().toISOString() });

  useEffect(() => {
    const updateNetwork = () => {
      const online = navigator.onLine;
      setOffline(!online);
      setNetwork({ online, lastChangedAt: new Date().toISOString() });

      if (online) {
        void offlineEngine.sync();
      }
    };

    window.addEventListener("online", updateNetwork);
    window.addEventListener("offline", updateNetwork);

    return () => {
      window.removeEventListener("online", updateNetwork);
      window.removeEventListener("offline", updateNetwork);
    };
  }, []);

  const value = useMemo<AppContextValue>(() => ({
    currentUser,
    organization,
    theme,
    offline,
    network,
    authentication: { authenticated: Boolean(currentUser), authenticating: false },
    offlineEngine,
    setCurrentUser,
    setOrganization,
    setTheme,
    setOffline,
  }), [currentUser, offline, organization, theme, network]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const value = useContext(AppContext);

  if (!value) {
    throw new Error("useAppContext must be used within AppContextProvider");
  }

  return value;
}
