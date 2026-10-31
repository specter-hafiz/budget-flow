import { useTheme } from "@shopify/restyle";
import { View, type ViewStyle } from "react-native";

import type { AppTheme } from "@/core/theme/restyle";

interface CustomDividerProps {
  marginVertical?: number;
  style?: ViewStyle;
}

export default function CustomDivider({
  marginVertical = 0,
  style,
}: CustomDividerProps) {
  const theme = useTheme<AppTheme>();

  return (
    <View
      accessibilityRole="none"
      style={[
        {
          height: 1,
          backgroundColor: theme.colors.border,
          marginVertical,
        },
        style,
      ]}
    />
  );
}
