import { useTheme } from "@shopify/restyle";
import { StyleSheet, View } from "react-native";

import type { AppTheme } from "@/core/theme/restyle";
import CustomCard from "@/shared/components/CustomCard";
import CustomText from "@/shared/components/CustomText";
import { useCurrency } from "@/shared/hooks/useCurrency";

interface AnalyticsSummaryCardProps {
  title: string;
  amount: number;
  color: string;
}

export default function AnalyticsSummaryCard({
  title,
  amount,
  color,
}: AnalyticsSummaryCardProps) {
  const theme = useTheme<AppTheme>();
  const { formatCurrency } = useCurrency();
  return (
    <CustomCard>
      <View style={styles.container}>
        <View style={[styles.indicator, { backgroundColor: color }]} />

        <CustomText
          variant="body"
          style={{ color: theme.colors.textSecondary }}
        >
          {title}
        </CustomText>

        <CustomText
          variant="heading"
          style={[styles.amount, { color: theme.colors.text }]}
        >
          {formatCurrency(amount)}
        </CustomText>
      </View>
    </CustomCard>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  indicator: {
    width: 32,
    height: 4,
    borderRadius: 2,
  },
  amount: {
    fontSize: 20,
  },
});
