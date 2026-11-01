import { useTheme } from "@shopify/restyle";
import { SquarePen, UserRound } from "lucide-react-native";
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";

import { useAppState } from "@/core/providers/AppStateProvider";
import type { AppTheme } from "@/core/theme/restyle";
import CustomCard from "@/shared/components/CustomCard";
import CustomText from "@/shared/components/CustomText";

interface ProfileCardProps {
  name: string;
  subtitle: string;
  onEdit: () => void;
  editAccessibilityLabel: string;
}

export default function ProfileCard({
  name,
  subtitle,
  onEdit,
  editAccessibilityLabel,
}: ProfileCardProps) {
  const theme = useTheme<AppTheme>();
  const { state } = useAppState();

  const profile = state.profile;
  return (
    <CustomCard
      flexDirection="row"
      alignItems="center"
      gap="md"
      borderRadius="lg"
      marginBottom="md"
      padding="sm"
    >
      <View
        style={{
          width: 58,
          height: 58,
          borderRadius: 29,
          backgroundColor: theme.colors.background,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {profile?.photoUri ? (
          <Image
            source={{ uri: profile.photoUri }}
            style={styles.profileImage}
          />
        ) : (
          <UserRound size={28} color={theme.colors.textSecondary} />
        )}
      </View>

      <View style={{ flex: 1, gap: 4 }}>
        <CustomText variant="subheading" color="primary" numberOfLines={1}>
          {name}
        </CustomText>

        <CustomText variant="body" color="textSecondary">
          {subtitle}
        </CustomText>
      </View>

      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel={editAccessibilityLabel}
        onPress={onEdit}
        hitSlop={10}
        style={{ padding: 8 }}
      >
        <SquarePen size={20} color={theme.colors.textSecondary} />
      </TouchableOpacity>
    </CustomCard>
  );
}

const styles = StyleSheet.create({
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 28.5,
  },
});
