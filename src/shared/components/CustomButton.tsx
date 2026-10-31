import { createBox, createText } from "@shopify/restyle";
import { TouchableOpacity, ViewStyle } from "react-native";

import { AppTheme } from "../../core/theme/restyle";

const Box = createBox<AppTheme>();
const Text = createText<AppTheme>();

type CustomButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary";
  style?: ViewStyle;
};

export default function CustomButton({
  label,
  onPress,
  disabled = false,
  variant = "primary",
  style,
}: CustomButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      style={style}
    >
      <Box
        backgroundColor={
          disabled
            ? "border"
            : variant === "primary"
              ? "primary"
              : "textSecondary"
        }
        padding="md"
        borderRadius="md"
        alignItems="center"
        opacity={disabled ? 0.6 : 1}
      >
        <Text
          color={disabled ? "textSecondary" : "surface"}
          fontSize={16}
          fontWeight="600"
        >
          {label}
        </Text>
      </Box>
    </TouchableOpacity>
  );
}
