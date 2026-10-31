import { storage } from "@/core/storage/mmkv";
import { ThemeProvider as RestyleProvider } from "@shopify/restyle";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import { useColorScheme } from "react-native";
import type { AppTheme } from "./restyle";
import { darkTheme, lightTheme } from "./restyle";

export type ThemePreference = "light" | "dark" | "system";

const THEME_PREFERENCE_KEY = "budgetflow-theme-preference";

function isThemePreference(value: unknown): value is ThemePreference {
  return value === "light" || value === "dark" || value === "system";
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

type ThemeContextValue = {
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => void;
  isDark: boolean;
};

export function ThemeProvider({ children }: PropsWithChildren) {
  const systemScheme = useColorScheme();

  const [preference, setPreferenceState] = useState<ThemePreference>(() => {
    const savedPreference = storage.getString(THEME_PREFERENCE_KEY);
    return isThemePreference(savedPreference) ? savedPreference : "system";
  });

  const setPreference = useCallback((nextPreference: ThemePreference) => {
    storage.set(THEME_PREFERENCE_KEY, nextPreference);
    setPreferenceState(nextPreference);
  }, []);

  const isDark =
    preference === "dark" ||
    (preference === "system" && systemScheme === "dark");

  const theme = useMemo<AppTheme>(
    () => (isDark ? darkTheme : lightTheme),
    [isDark],
  );

  const contextValue = useMemo(
    () => ({ preference, setPreference, isDark }),
    [preference, setPreference, isDark],
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      <RestyleProvider theme={theme}>{children}</RestyleProvider>
    </ThemeContext.Provider>
  );
}

export function useAppTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useAppTheme must be used inside ThemeProvider");
  }

  return context;
}
