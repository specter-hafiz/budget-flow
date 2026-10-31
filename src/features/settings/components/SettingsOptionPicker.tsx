import { useTheme } from "@shopify/restyle";
import { Check } from "lucide-react-native";
import { Modal, TouchableOpacity, View } from "react-native";

import type { AppTheme } from "@/core/theme/restyle";
import CustomText from "@/shared/components/CustomText";

export interface SettingsOption<T extends string = string> {
  label: string;
  value: T;
}

interface SettingsOptionPickerProps<T extends string> {
  visible: boolean;
  title: string;
  options: readonly SettingsOption<T>[];
  selectedValue: T;
  onSelect: (value: T) => void;
  onClose: () => void;
  closeAccessibilityLabel: string;
}

export default function SettingsOptionPicker<T extends string>({
  visible,
  title,
  options,
  selectedValue,
  onSelect,
  onClose,
  closeAccessibilityLabel,
}: SettingsOptionPickerProps<T>) {
  const theme = useTheme<AppTheme>();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          padding: 24,
          backgroundColor: "rgba(0,0,0,0.45)",
        }}
      >
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={closeAccessibilityLabel}
          onPress={onClose}
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
          }}
        />

        <View
          style={{
            backgroundColor: theme.colors.surface,
            borderRadius: 20,
            padding: 20,
          }}
        >
          <CustomText variant="title" color="text" marginBottom="md">
            {title}
          </CustomText>

          {options.map((option) => {
            const selected = selectedValue === option.value;

            return (
              <TouchableOpacity
                key={option.value}
                accessibilityRole="button"
                accessibilityLabel={option.label}
                accessibilityState={{ selected }}
                onPress={() => onSelect(option.value)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingVertical: 14,
                  borderBottomWidth: 1,
                  borderBottomColor: theme.colors.border,
                }}
              >
                <CustomText
                  variant="body"
                  color={selected ? "primary" : "text"}
                >
                  {option.label}
                </CustomText>

                {selected ? (
                  <Check size={20} color={theme.colors.primary} />
                ) : null}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </Modal>
  );
}
