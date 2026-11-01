import "@/core/i18n";
import i18n from "@/core/i18n";
import {
  AppStateProvider,
  useAppState,
} from "@/core/providers/AppStateProvider";
import { ThemeProvider } from "@/core/theme/ThemeProvider";
import BudgetFlowSplash from "@/shared/components/SplashScreen";
import { useFonts } from "expo-font";
import { SplashScreen, Stack } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
void SplashScreen.preventAutoHideAsync();

function LanguageSync() {
  const { state } = useAppState();
  useEffect(() => {
    void i18n.changeLanguage(state.settings.language || "en");
  }, [state.settings.language]);
  return null;
}
export default function RootLayout() {
  const [showSplash, setShowSplash] = useState(true);
  const [fontsLoaded] = useFonts({
    InterRegular: require("../../assets/fonts/Inter-Regular.ttf"),
    InterMedium: require("../../assets/fonts/Inter-Medium.ttf"),
    InterBold: require("../../assets/fonts/Inter-Bold.ttf"),
    InterSemiBold: require("../../assets/fonts/Inter-SemiBold.ttf"),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync().then(() => {
        setShowSplash(false);
      });
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }
  return (
    <View style={styles.container}>
      <ThemeProvider>
        <AppStateProvider>
          <LanguageSync />
          <Stack screenOptions={{ headerShown: false }} />
        </AppStateProvider>
      </ThemeProvider>

      {showSplash && (
        <View
          style={StyleSheet.absoluteFill}
          onLayout={() => {
            setShowSplash(false);
          }}
        >
          <BudgetFlowSplash />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
