import { createContext, useContext, type ReactNode } from "react";
import { getSettings } from "./api";
import { useAsync } from "./useAsync";
import type { SiteSettings } from "./types";

const SiteSettingsContext = createContext<SiteSettings>({});

/** Loads public site settings once and shares them across the app. */
export function SiteSettingsProvider({ children }: { children: ReactNode }) {
  const { data } = useAsync<SiteSettings>((signal) => getSettings(signal), []);
  return <SiteSettingsContext.Provider value={data ?? {}}>{children}</SiteSettingsContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSiteSettings() {
  return useContext(SiteSettingsContext);
}
