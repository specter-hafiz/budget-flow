import { useTheme } from "@shopify/restyle";
import { StyleSheet, TextInput, type TextInputProps, View } from "react-native";

import type { AppTheme } from "@/core/theme/restyle";

export interface CustomTextInputProps extends TextInputProps {
  containerStyle?: object;
}

export default function CustomTextInput({
  containerStyle,
  style,
  placeholderTextColor,
  ...props
}: CustomTextInputProps) {
  const theme = useTheme<AppTheme>();

  return (
    <View
      style={[
        styles.container,
        style,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
        },
        containerStyle,
      ]}
    >
      <TextInput
        {...props}
        placeholderTextColor={
          placeholderTextColor ?? theme.colors.textSecondary
        }
        style={[
          styles.input,
          {
            color: theme.colors.text,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
  },
  input: {
    minHeight: 48,
    paddingVertical: 12,
    fontSize: 16,
  },
});
