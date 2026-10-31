import { useTheme } from "@shopify/restyle";
import { StyleSheet, View } from "react-native";

import type { AppTheme } from "@/core/theme/restyle";
import type { CategorySpending } from "@/features/analytics/utils/calculateSpendingByCategory";
import { TRANSACTION_CATEGORIES } from "@/features/transactions/constants/categories";
import CustomText from "@/shared/components/CustomText";
import { useCurrency } from "@/shared/hooks/useCurrency";
import { useTranslation } from "react-i18next";

interface SpendingByCategoryProps {
  items: CategorySpending[];
}

export default function SpendingByCategory({ items }: SpendingByCategoryProps) {
  const theme = useTheme<AppTheme>();
  const { t } = useTranslation();
  const { formatCurrency } = useCurrency();
  if (items.length === 0) {
    return (
      <View style={styles.emptyState}>
        <CustomText variant="body" color="textSecondary">
          {t("analytics.noExpenses")}
        </CustomText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {items.map((item) => (
        <View key={item.categoryId} style={styles.category}>
          <View style={styles.categoryHeader}>
            <CustomText variant="body">
              {TRANSACTION_CATEGORIES.some(
                (category) => category.id === item.categoryId,
              )
                ? t(`categories.${item.categoryId}`)
                : item.categoryName}
            </CustomText>

            <View style={styles.amountContainer}>
              <CustomText variant="body">
                {formatCurrency(item.total)}
              </CustomText>

              <CustomText variant="caption" color="textSecondary">
                {item.percentage.toFixed(1)}%
              </CustomText>
            </View>
          </View>

          <View
            style={[styles.track, { backgroundColor: theme.colors.border }]}
          >
            <View
              style={[
                styles.progress,
                {
                  width: `${Math.min(item.percentage, 100)}%`,
                  backgroundColor: theme.colors.primary,
                },
              ]}
            />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 20,
  },
  category: {
    gap: 10,
  },
  categoryHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  amountContainer: {
    alignItems: "flex-end",
    gap: 3,
  },
  track: {
    height: 8,
    borderRadius: 999,
    overflow: "hidden",
  },
  progress: {
    height: "100%",
    borderRadius: 999,
  },
  emptyState: {
    paddingVertical: 20,
    alignItems: "center",
  },
});
