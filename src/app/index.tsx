import { useAppState } from "@/core/providers/AppStateProvider";
import { Redirect } from "expo-router";

export default function Index() {
  const { state } = useAppState();

  return (
    <Redirect
      href={state.onboardingComplete ? "/(tabs)/home" : "/onboarding"}
    />
  );
}
