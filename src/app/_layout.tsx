import "@/core/i18n";
import i18n from "@/core/i18n";
import {
  AppStateProvider,
  useAppState,
} from "@/core/providers/AppStateProvider";
import { ThemeProvider } from "@/core/theme/ThemeProvider";
import { useFonts } from "expo-font";
import { SplashScreen, Stack } from "expo-router";
import { useEffect } from "react";

function LanguageSync() {
  const { state } = useAppState();
  useEffect(() => {
    void i18n.changeLanguage(state.settings.language || "en");
  }, [state.settings.language]);
  return null;
}
export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    InterRegular: require("../../assets/fonts/Inter-Regular.ttf"),
    InterMedium: require("../../assets/fonts/Inter-Medium.ttf"),
    InterBold: require("../../assets/fonts/Inter-Bold.ttf"),
    InterSemiBold: require("../../assets/fonts/Inter-SemiBold.ttf"),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }
  return (
    <ThemeProvider>
      <AppStateProvider>
        <LanguageSync />
        <Stack screenOptions={{ headerShown: false }} />
      </AppStateProvider>
    </ThemeProvider>
  );
}
