import { useTheme } from "@shopify/restyle";
import { ChevronRight, type LucideIcon } from "lucide-react-native";
import { TouchableOpacity, View } from "react-native";

import type { AppTheme } from "@/core/theme/restyle";
import CustomText from "@/shared/components/CustomText";

interface SettingsRowProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  value?: string;
  onPress: () => void;
  showChevron?: boolean;
  iconColor?: keyof AppTheme["colors"];
  textColor?: keyof AppTheme["colors"];
}

export default function SettingsRow({
  icon: Icon,
  title,
  description,
  value,
  onPress,
  showChevron = true,
  iconColor = "textSecondary",
  textColor = "text",
}: SettingsRowProps) {
  const theme = useTheme<AppTheme>();

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={title}
      onPress={onPress}
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
      }}
    >
      <Icon size={22} color={theme.colors[iconColor]} />

      <View style={{ flex: 1, gap: 4 }}>
        <CustomText variant="body" color={textColor}>
          {title}
        </CustomText>

        {description ? (
          <CustomText variant="caption" color="textSecondary">
            {description}
          </CustomText>
        ) : null}
      </View>

      {value ? (
        <CustomText variant="body" color="textSecondary">
          {value}
        </CustomText>
      ) : null}

      {showChevron ? (
        <ChevronRight size={18} color={theme.colors[iconColor]} />
      ) : null}
    </TouchableOpacity>
  );
}
