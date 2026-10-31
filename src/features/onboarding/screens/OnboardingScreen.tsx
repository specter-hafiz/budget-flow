import { useAppState } from "@/core/providers/AppStateProvider";
import { AppTheme } from "@/core/theme/restyle";
import CustomButton from "@/shared/components/CustomButton";
import CustomText from "@/shared/components/CustomText";
import CustomTextInput from "@/shared/components/CustomTextInput";
import { useTheme } from "@shopify/restyle";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import {
  CameraIcon,
  Check,
  ChevronDown,
  PersonStanding,
} from "lucide-react-native";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { saveProfilePhoto } from "../services/profilePhotoService";

const AVATAR_SIZE = 112;
const BADGE_SIZE = 32;
const MAX_NAME_LENGTH = 40;
const SUPPORTED_LANGUAGES = [
  { code: "en", label: "English" },
  { code: "fr", label: "Français" },
  { code: "es", label: "Español" },
  { code: "pt", label: "Português" },
] as const;

export function OnboardingScreen() {
  const { dispatch } = useAppState();
  const theme = useTheme<AppTheme>();
  const { t, i18n } = useTranslation();

  const [name, setName] = useState("");
  const [languageDropdownVisible, setLanguageDropdownVisible] = useState(false);
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  const trimmedName = name.trim();
  const canContinue = trimmedName.length > 0;

  const pickPhoto = useCallback(async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled || !result.assets[0]) {
        return;
      }

      // Copy the image into BudgetFlow's persistent storage.
      const permanentUri = saveProfilePhoto(result.assets[0].uri);

      // Update the avatar preview.
      setPhotoUri(permanentUri);
    } catch (error) {
      console.error("[BudgetFlow] Failed to select profile photo:", error);

      Alert.alert(
        t("onboarding.photoErrorTitle"),
        t("onboarding.photoErrorMessage"),
      );
    }
  }, [t]);

  const handleLanguageChange = useCallback(
    async (language: string) => {
      try {
        // Save the preference to MMKV through AppStateProvider.
        dispatch({
          type: "UPDATE_SETTINGS",
          payload: {
            language,
          },
        });

        // Update the interface immediately.
        await i18n.changeLanguage(language);
      } catch (error) {
        console.error("[BudgetFlow] Failed to change language:", error);

        Alert.alert(
          t("onboarding.saveErrorTitle"),
          t("onboarding.saveErrorMessage"),
        );
      }
    },
    [dispatch, i18n, t],
  );

  const handleContinue = useCallback(() => {
    if (!canContinue) return;

    try {
      dispatch({
        type: "COMPLETE_ONBOARDING",
        payload: {
          name: trimmedName,
          photoUri,
        },
      });

      router.replace("/");
    } catch (error) {
      console.error("[BudgetFlow] Failed to complete onboarding:", error);

      Alert.alert(
        t("onboarding.saveErrorTitle"),
        t("onboarding.saveErrorMessage"),
      );
    }
  }, [canContinue, dispatch, trimmedName, photoUri, t]);

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: theme.colors.background,
      }}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
            padding: theme.spacing.lg,
          }}
        >
          <CustomText variant="heading" textAlign="center">
            {t("onboarding.welcome")}
          </CustomText>

          {/* Language dropdown */}
          <View
            style={{
              alignItems: "center",
              marginVertical: theme.spacing.xl,
            }}
          >
            <TouchableOpacity
              onPress={() => setLanguageDropdownVisible(true)}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Select language"
              accessibilityState={{
                expanded: languageDropdownVisible,
              }}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: theme.spacing.sm,
                paddingHorizontal: 10,
                paddingVertical: 10,
                borderWidth: 1,
                borderColor: theme.colors.textSecondary,
                borderRadius: 12,
              }}
            >
              <CustomText variant="body">
                {SUPPORTED_LANGUAGES.find(
                  (language) =>
                    language.code ===
                    (i18n.resolvedLanguage ?? i18n.language).split("-")[0],
                )?.label ?? "English"}
              </CustomText>

              <ChevronDown size={18} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <Modal
            visible={languageDropdownVisible}
            transparent
            animationType="fade"
            onRequestClose={() => setLanguageDropdownVisible(false)}
          >
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => setLanguageDropdownVisible(false)}
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "rgba(0,0,0,0.35)",
                padding: 24,
              }}
            >
              <View
                style={{
                  width: "100%",
                  maxWidth: 320,
                  backgroundColor: theme.colors.background,
                  borderRadius: 16,
                  padding: 8,
                }}
                onStartShouldSetResponder={() => true}
              >
                {SUPPORTED_LANGUAGES.map((language) => {
                  const selected =
                    (i18n.resolvedLanguage ?? i18n.language).split("-")[0] ===
                    language.code;

                  return (
                    <TouchableOpacity
                      key={language.code}
                      onPress={async () => {
                        await handleLanguageChange(language.code);
                        setLanguageDropdownVisible(false);
                      }}
                      accessibilityRole="button"
                      accessibilityState={{ selected }}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        paddingHorizontal: 16,
                        paddingVertical: 14,
                        borderRadius: 10,
                        backgroundColor: selected
                          ? theme.colors.primaryLight
                          : "transparent",
                      }}
                    >
                      <CustomText variant="body">{language.label}</CustomText>

                      {selected && (
                        <Check size={18} color={theme.colors.primary} />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </TouchableOpacity>
          </Modal>

          <CustomText variant="body" marginTop="sm" textAlign="center">
            {t("onboarding.subtitle")}
          </CustomText>

          {/* Avatar picker */}
          <View
            style={{
              alignItems: "center",
              marginTop: theme.spacing.xl,
            }}
          >
            <TouchableOpacity
              onPress={pickPhoto}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel={
                photoUri
                  ? t("onboarding.changePhoto")
                  : t("onboarding.addPhoto")
              }
            >
              <View
                style={{
                  width: AVATAR_SIZE,
                  height: AVATAR_SIZE,
                  borderRadius: AVATAR_SIZE / 2,
                  backgroundColor: theme.colors.primaryLight,
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                }}
              >
                {photoUri ? (
                  <Image
                    source={{ uri: photoUri }}
                    style={{
                      width: AVATAR_SIZE,
                      height: AVATAR_SIZE,
                    }}
                    accessibilityIgnoresInvertColors
                  />
                ) : (
                  <PersonStanding
                    size={AVATAR_SIZE * 0.45}
                    color={theme.colors.primary}
                  />
                )}
              </View>

              {/* Camera badge */}
              <View
                style={{
                  position: "absolute",
                  right: 0,
                  bottom: 0,
                  width: BADGE_SIZE,
                  height: BADGE_SIZE,
                  borderRadius: BADGE_SIZE / 2,
                  backgroundColor: theme.colors.primary,
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: 3,
                  borderColor: theme.colors.background,
                }}
              >
                <CameraIcon size={16} color="#FFFFFF" />
              </View>
            </TouchableOpacity>

            <CustomText variant="caption" marginTop="sm">
              {t("onboarding.profilePhoto")}
            </CustomText>
          </View>

          {/* Name */}
          <CustomText variant="title" marginTop="xl">
            {t("onboarding.nameQuestion")}
          </CustomText>

          <CustomTextInput
            value={name}
            onChangeText={setName}
            placeholder={t("onboarding.namePlaceholder")}
            placeholderTextColor={theme.colors.textSecondary}
            autoCapitalize="words"
            autoComplete="name-given"
            textContentType="givenName"
            maxLength={MAX_NAME_LENGTH}
            returnKeyType="done"
            onSubmitEditing={handleContinue}
            accessibilityLabel={t("onboarding.nameAccessibility")}
            style={{ marginTop: theme.spacing.sm }}
          />

          <CustomButton
            label={t("onboarding.continue")}
            onPress={handleContinue}
            disabled={!canContinue}
            style={{ marginTop: theme.spacing.lg }}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
