import { useTheme } from "@shopify/restyle";
import {
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import type { AppTheme } from "@/core/theme/restyle";
import CustomButton from "@/shared/components/CustomButton";
import CustomText from "@/shared/components/CustomText";
import { CameraIcon, UserRound } from "lucide-react-native";

interface EditProfileModalProps {
  visible: boolean;
  name: string;
  error: string;
  title: string;
  nameLabel: string;
  namePlaceholder: string;
  cancelLabel: string;
  saveLabel: string;
  onChangeName: (value: string) => void;
  onSave: () => void;
  onClose: () => void;
  photoUri: string | null;
  onPickPhoto: () => void;
  photoAccessibilityLabel: string;
}

export default function EditProfileModal({
  visible,
  name,
  error,
  title,
  nameLabel,
  namePlaceholder,
  cancelLabel,
  saveLabel,
  onChangeName,
  onSave,
  onClose,
  photoUri,
  photoAccessibilityLabel,
  onPickPhoto,
}: EditProfileModalProps) {
  const theme = useTheme<AppTheme>();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{
          flex: 1,
          justifyContent: "center",
          padding: 24,
          backgroundColor: "rgba(0,0,0,0.45)",
        }}
      >
        <View
          style={{
            backgroundColor: theme.colors.surface,
            padding: 24,
            borderRadius: 20,
            gap: 16,
          }}
        >
          <CustomText variant="heading" color="primary">
            {title}
          </CustomText>

          <View style={{ alignItems: "center" }}>
            <TouchableOpacity
              onPress={onPickPhoto}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel={photoAccessibilityLabel}
              style={{
                width: 112,
                height: 112,
              }}
            >
              <View
                style={{
                  width: 112,
                  height: 112,
                  borderRadius: 56,
                  backgroundColor: theme.colors.primaryLight,
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                }}
              >
                {photoUri ? (
                  <Image
                    source={{ uri: photoUri }}
                    style={{ width: 112, height: 112 }}
                    accessibilityIgnoresInvertColors
                  />
                ) : (
                  <UserRound size={48} color={theme.colors.primary} />
                )}
              </View>

              <View
                style={{
                  position: "absolute",
                  right: 0,
                  bottom: 0,
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: theme.colors.primary,
                  borderWidth: 3,
                  borderColor: theme.colors.surface,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <CameraIcon size={16} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
          </View>

          <CustomText color="textSecondary">{nameLabel}</CustomText>

          <TextInput
            value={name}
            onChangeText={onChangeName}
            placeholder={namePlaceholder}
            placeholderTextColor={theme.colors.textSecondary}
            autoCapitalize="words"
            returnKeyType="done"
            maxLength={60}
            style={{
              color: theme.colors.primary,
              borderColor: theme.colors.border,
              borderWidth: 1,
              borderRadius: 10,
              padding: 12,
              fontSize: 16,
            }}
          />

          {error ? <CustomText color="danger">{error}</CustomText> : null}

          <View style={{ flexDirection: "row", gap: 12 }}>
            <View style={{ flex: 1 }}>
              <CustomButton
                label={cancelLabel}
                variant="secondary"
                onPress={onClose}
              />
            </View>

            <View style={{ flex: 1 }}>
              <CustomButton label={saveLabel} onPress={onSave} />
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
