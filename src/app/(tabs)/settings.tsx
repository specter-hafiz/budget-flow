import { useAppState } from "@/core/providers/AppStateProvider";
import type { AppTheme } from "@/core/theme/restyle";
import { useAppTheme } from "@/core/theme/ThemeProvider";
import {
  deleteProfilePhoto,
  saveProfilePhoto,
} from "@/features/onboarding/services/profilePhotoService";
import EditProfileModal from "@/features/settings/components/EditProfileModal";
import ProfileCard from "@/features/settings/components/ProfileCard";
import SettingsOptionPicker from "@/features/settings/components/SettingsOptionPicker";
import SettingsRow from "@/features/settings/components/SettingsRow";
import SettingsSection from "@/features/settings/components/SettingsSection";
import {
  CURRENCY_OPTIONS,
  LANGUAGE_OPTIONS,
} from "@/features/settings/constants/settings-options";
import {
  exportBackup,
  importBackup,
} from "@/features/settings/services/backupService";
import CustomCard from "@/shared/components/CustomCard";
import CustomDivider from "@/shared/components/CustomDivider";
import CustomText from "@/shared/components/CustomText";
import { useTheme } from "@shopify/restyle";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import {
  Banknote,
  DatabaseBackup,
  Languages,
  LogOut,
  Moon,
  Sun,
  Tags,
  Upload,
} from "lucide-react-native";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const SettingsScreen = () => {
  const theme = useTheme<AppTheme>();
  const { preference: themePreference, setPreference: setThemePreference } =
    useAppTheme();
  const { state, dispatch, applyBackup } = useAppState();
  const [showLanguagePicker, setShowLanguagePicker] = useState(false);
  const [editedName, setEditedName] = useState(state.profile?.name || "");
  const [editedPhotoUri, setEditedPhotoUri] = useState<string | null>(
    state.profile?.photoUri ?? null,
  );
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [nameError, setNameError] = useState("");
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);
  const [showThemePicker, setShowThemePicker] = useState(false);
  const { t } = useTranslation();
  const name = state.profile?.name || `${t("settings.yourName")}`;
  const subtitle = state.profile
    ? `${t("settings.personalAccount")}`
    : `${t("settings.setUpYourProfile")}`;

  const handlePickProfilePhoto = async () => {
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

      const permanentUri = saveProfilePhoto(result.assets[0].uri);

      // Delete the previous unsaved photo, if there is one.
      if (editedPhotoUri && editedPhotoUri !== state.profile?.photoUri) {
        try {
          deleteProfilePhoto(editedPhotoUri);
        } catch (error) {
          console.error(
            "[BudgetFlow] Failed to clean up unsaved photo:",
            error,
          );
        }
      }

      setEditedPhotoUri(permanentUri);
    } catch (error) {
      console.error("[BudgetFlow] Failed to select profile photo:", error);

      Alert.alert(
        t("onboarding.photoErrorTitle"),
        t("onboarding.photoErrorMessage"),
      );
    }
  };

  const handleCancelProfileEdit = () => {
    // Only remove a photo that hasn't been saved to the profile.
    if (editedPhotoUri && editedPhotoUri !== state.profile?.photoUri) {
      try {
        deleteProfilePhoto(editedPhotoUri);
      } catch (error) {
        console.error(
          "[BudgetFlow] Failed to clean up cancelled photo:",
          error,
        );
      }
    }

    setEditedPhotoUri(state.profile?.photoUri ?? null);
    setIsEditingProfile(false);
    setNameError("");
  };

  const handleSaveProfile = () => {
    const trimmedName = editedName.trim();

    if (!trimmedName) {
      setNameError(`${t("settings.nameRequired")}`);
      return;
    }

    if (state.profile) {
      dispatch({
        type: "UPDATE_PROFILE",
        payload: { name: trimmedName, photoUri: editedPhotoUri },
      });
    } else {
      dispatch({
        type: "COMPLETE_ONBOARDING",
        payload: {
          name: trimmedName,
          photoUri: editedPhotoUri,
        },
      });
    }

    setNameError("");
    setIsEditingProfile(false);
  };

  const handleRestoreData = async () => {
    try {
      const backup = await importBackup();

      // User canceled the file picker.
      if (!backup) return;

      Alert.alert(
        t("settings.restoreModeTitle"),
        t("settings.restoreModeDescription"),
        [
          {
            text: t("settings.cancel"),
            style: "cancel",
          },
          {
            text: t("settings.mergeData"),

            onPress: () => {
              try {
                applyBackup(backup.data, "merge");

                Alert.alert(
                  t("settings.mergeSuccessTitle"),
                  t("settings.mergeSuccessDescription"),
                );
              } catch (error) {
                console.error("[BudgetFlow] Backup merge failed:", error);

                Alert.alert(
                  t("settings.restoreErrorTitle"),
                  t("settings.restoreErrorDescription"),
                );
              }
            },
          },
          {
            text: t("settings.replaceData"),
            style: "destructive",

            onPress: () => {
              try {
                applyBackup(backup.data, "replace");

                Alert.alert(
                  t("settings.restoreSuccessTitle"),
                  t("settings.restoreSuccessDescription"),
                );
              } catch (error) {
                console.error("[BudgetFlow] Backup replacement failed:", error);

                Alert.alert(
                  t("settings.restoreErrorTitle"),
                  t("settings.restoreErrorDescription"),
                );
              }
            },
          },
        ],
      );
    } catch (error) {
      console.error("Failed to restore BudgetFlow backup:", error);

      Alert.alert(
        t("settings.restoreFailedTitle"),
        t("settings.restoreFailedDescription"),
      );
    }
  };

  const handleBackupData = async () => {
    try {
      await exportBackup(state);
    } catch (error) {
      console.error("Failed to export BudgetFlow backup:", error);

      Alert.alert(
        t("settings.backupFailed"),
        t("settings.backupFailedDescription"),
      );
    }
  };

  return (
    <SafeAreaView
      edges={["top"]}
      style={{
        flex: 1,
        backgroundColor: theme.colors.background,
        paddingHorizontal: theme.spacing.lg,
      }}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <CustomText variant="heading" color="text" marginBottom="sm">
          {t("settings.title")}
        </CustomText>

        <ProfileCard
          name={name}
          subtitle={subtitle}
          editAccessibilityLabel={t("settings.editProfile")}
          onEdit={() => {
            setEditedName(state.profile?.name ?? "");
            setEditedPhotoUri(state.profile?.photoUri ?? null);
            setNameError("");
            setIsEditingProfile(true);
          }}
        />
        <SettingsSection title={t("settings.general")}>
          {/* Language */}
          {/* Language */}
          <SettingsRow
            icon={Languages}
            title={t("settings.language")}
            description={t("settings.languageDescription")}
            value={
              LANGUAGE_OPTIONS.find(
                (language) => language.value === state.settings.language,
              )?.label ?? "English"
            }
            onPress={() => setShowLanguagePicker(true)}
          />

          <CustomDivider />

          {/* Manage Categories */}
          <SettingsRow
            icon={Tags}
            title={t("settings.manageCategories")}
            description={t("settings.manageCategoriesDescription")}
            onPress={() => router.push("/manage-categories")}
          />

          <CustomDivider />

          {/* Currency */}
          <SettingsRow
            icon={Banknote}
            title={t("settings.currency")}
            description={t("settings.currencyDescription")}
            value={
              CURRENCY_OPTIONS.find(
                (currency) => currency.value === state.settings.currency,
              )?.value ?? "GHS"
            }
            onPress={() => setShowCurrencyPicker(true)}
          />
        </SettingsSection>
        {/* Appearance */}
        <SettingsSection title={t("settings.appearance")}>
          <SettingsRow
            icon={themePreference === "dark" ? Moon : Sun}
            title={t("settings.theme")}
            description={t("settings.themeDescription")}
            value={t(`settings.themeOptions.${themePreference}`)}
            onPress={() => setShowThemePicker(true)}
          />
        </SettingsSection>
        {/* Data Management */}
        <SettingsSection title={t("settings.dataManagement")}>
          {/* Backup Data */}
          <SettingsRow
            icon={DatabaseBackup}
            title={t("settings.backupData")}
            description={t("settings.backupDataDescription")}
            onPress={handleBackupData}
          />

          <CustomDivider />

          {/* Restore Data */}
          <SettingsRow
            icon={Upload}
            title={t("settings.restoreData")}
            description={t("settings.restoreDataDescription")}
            onPress={handleRestoreData}
          />
        </SettingsSection>
        <CustomDivider style={{ marginBottom: theme.spacing.md }} />
        {/* Logout */}
        <CustomCard
          borderRadius="lg"
          gap="md"
          padding="md"
          backgroundColor="primary"
          borderWidth={1}
          borderColor="border"
          marginBottom="md"
        >
          <SettingsRow
            icon={LogOut}
            title={t("settings.logout")}
            iconColor="surface"
            textColor="surface"
            onPress={() => {
              dispatch({ type: "LOGOUT" });
              router.replace("/");
            }}
          />
        </CustomCard>

        {/* Modal for Editing Profile*/}
        {/* Edit Profile Modal */}
        <EditProfileModal
          visible={isEditingProfile}
          name={editedName}
          error={nameError}
          title={t("settings.editProfile")}
          nameLabel={t("settings.displayName")}
          namePlaceholder={t("settings.namePlaceholder")}
          cancelLabel={t("settings.cancel")}
          saveLabel={t("settings.saveChanges")}
          onChangeName={(value) => {
            setEditedName(value);
            setNameError("");
          }}
          onSave={handleSaveProfile}
          onClose={handleCancelProfileEdit}
          photoUri={editedPhotoUri}
          onPickPhoto={handlePickProfilePhoto}
          photoAccessibilityLabel={t("onboarding.changePhoto")}
        />
        {/* Modal for Language Picker */}
        {/* Language Picker */}
        <SettingsOptionPicker
          visible={showLanguagePicker}
          closeAccessibilityLabel={t("settings.closePicker")}
          title={t("settings.selectLanguage")}
          options={LANGUAGE_OPTIONS}
          selectedValue={state.settings.language}
          onSelect={(language) => {
            dispatch({
              type: "UPDATE_SETTINGS",
              payload: { language },
            });

            setShowLanguagePicker(false);
          }}
          onClose={() => setShowLanguagePicker(false)}
        />
        {/* Modal for Theme Picker */}
        {/* Theme Picker */}
        <SettingsOptionPicker
          visible={showThemePicker}
          title={t("settings.chooseTheme")}
          closeAccessibilityLabel={t("settings.closePicker")}
          options={[
            {
              label: t("settings.themeOptions.light"),
              value: "light",
            },
            {
              label: t("settings.themeOptions.dark"),
              value: "dark",
            },
            {
              label: t("settings.themeOptions.system"),
              value: "system",
            },
          ]}
          selectedValue={themePreference}
          onSelect={(selectedTheme) => {
            setThemePreference(selectedTheme);
            setShowThemePicker(false);
          }}
          onClose={() => setShowThemePicker(false)}
        />

        {/* Modal for Currency Picker */}
        {/* Currency Picker */}
        <SettingsOptionPicker
          closeAccessibilityLabel={t("settings.closePicker")}
          visible={showCurrencyPicker}
          title={t("settings.selectCurrency")}
          options={CURRENCY_OPTIONS}
          selectedValue={state.settings.currency}
          onSelect={(currency) => {
            dispatch({
              type: "UPDATE_SETTINGS",
              payload: { currency },
            });

            setShowCurrencyPicker(false);
          }}
          onClose={() => setShowCurrencyPicker(false)}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default SettingsScreen;
