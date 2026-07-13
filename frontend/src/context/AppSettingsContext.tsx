import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { SettingsState, ThemeMode } from "../types";

interface AppSettingsContextValue extends SettingsState {
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  setRefreshInterval: (value: number) => void;
  setNotificationsEnabled: (value: boolean) => void;
}

const STORAGE_KEY = "apm-dashboard-settings";

const defaultState: SettingsState = {
  theme: "dark",
  refreshInterval: 10,
  notificationsEnabled: true,
};

const AppSettingsContext = createContext<AppSettingsContextValue | undefined>(undefined);

const readStoredSettings = (): SettingsState => {
  if (typeof window === "undefined") {
    return defaultState;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;
    return { ...defaultState, ...(JSON.parse(raw) as Partial<SettingsState>) };
  } catch {
    return defaultState;
  }
};

export const AppSettingsProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => readStoredSettings().theme);
  const [refreshInterval, setRefreshIntervalState] = useState<number>(() => readStoredSettings().refreshInterval);
  const [notificationsEnabled, setNotificationsEnabledState] = useState<boolean>(
    () => readStoredSettings().notificationsEnabled,
  );

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.classList.toggle("light", theme === "light");
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ theme, refreshInterval, notificationsEnabled }),
    );
  }, [theme, refreshInterval, notificationsEnabled]);

  const value = useMemo<AppSettingsContextValue>(
    () => ({
      theme,
      refreshInterval,
      notificationsEnabled,
      setTheme: (nextTheme) => setThemeState(nextTheme),
      toggleTheme: () => setThemeState((current) => (current === "dark" ? "light" : "dark")),
      setRefreshInterval: (value) => setRefreshIntervalState(value),
      setNotificationsEnabled: (value) => setNotificationsEnabledState(value),
    }),
    [notificationsEnabled, refreshInterval, theme],
  );

  return <AppSettingsContext.Provider value={value}>{children}</AppSettingsContext.Provider>;
};

export const useAppSettings = () => {
  const context = useContext(AppSettingsContext);
  if (!context) {
    throw new Error("useAppSettings must be used within AppSettingsProvider");
  }
  return context;
};
