import { useTheme } from "@shopify/restyle";
import { useMemo, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import { useAppState } from "@/core/providers/AppStateProvider";
import type { AppTheme } from "@/core/theme/restyle";
import AnalyticsDateRangeFilter from "@/features/analytics/components/AnalyticsRangeFilter";
import SpendingByCategory from "@/features/analytics/components/SpendingByCategory";
import SpendingDonutChart from "@/features/analytics/components/SpendingDonutChart";
import AnalyticsSummaryCard from "@/features/analytics/components/SummaryAnalyticsCard";
import {
  DEFAULT_ANALYTICS_FILTERS,
  type AnalyticsDateRange,
} from "@/features/analytics/types/analytics-filters.type";
import { calculateSpendingByCategory } from "@/features/analytics/utils/calculateSpendingByCategory";
import { getAnalyticsDateRange } from "@/features/analytics/utils/getAnalyticsDateRange";
import { getAnalyticsSummary } from "@/features/analytics/utils/getAnalyticsSummary";
import MonthlyBudgets from "@/features/budgets/components/MonthlyBudgets";
import CustomText from "@/shared/components/CustomText";
import { useTranslation } from "react-i18next";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AnalyticsScreen() {
  const theme = useTheme<AppTheme>();

  const { state } = useAppState();
  const { t } = useTranslation();
  const [selectedRange, setSelectedRange] = useState<AnalyticsDateRange>(
    DEFAULT_ANALYTICS_FILTERS.dateRange,
  );

  const summary = useMemo(
    () => getAnalyticsSummary(state.transactions, selectedRange),
    [state.transactions, selectedRange],
  );

  const spendingByCategory = useMemo(
    () =>
      calculateSpendingByCategory(
        state.transactions.filter((transaction) => {
          const transactionDate = new Date(transaction.date);
          const { startDate, endDate } = getAnalyticsDateRange(selectedRange);

          return (
            !Number.isNaN(transactionDate.getTime()) &&
            transactionDate >= startDate &&
            transactionDate <= endDate
          );
        }),
        state.customCategories,
      ),
    [state.transactions, selectedRange, state.customCategories],
  );

  return (
    <SafeAreaView
      edges={["top"]}
      style={{
        flex: 1,
        backgroundColor: theme.colors.background,
      }}
    >
      <ScrollView
        style={[styles.screen, { backgroundColor: theme.colors.background }]}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <CustomText variant="heading">{t("analytics.title")}</CustomText>
          <CustomText
            variant="body"
            style={{ color: theme.colors.textSecondary }}
          >
            {t("analytics.subtitle")}
          </CustomText>
        </View>

        <View style={styles.section}>
          <CustomText variant="subheading">{t("analytics.period")}</CustomText>
          <AnalyticsDateRangeFilter
            selectedRange={selectedRange}
            onRangeChange={setSelectedRange}
          />
        </View>

        <View style={styles.section}>
          <CustomText variant="subheading">
            {t("analytics.financialOverview")}
          </CustomText>

          <View style={styles.cards}>
            <AnalyticsSummaryCard
              title={t("analytics.totalIncome")}
              amount={summary.totalIncome}
              color={theme.colors.success}
            />

            <AnalyticsSummaryCard
              title={t("analytics.totalExpenses")}
              amount={summary.totalExpenses}
              color={theme.colors.danger}
            />

            <AnalyticsSummaryCard
              title={t("analytics.netBalance")}
              amount={summary.netBalance}
              color={
                summary.netBalance >= 0
                  ? theme.colors.success
                  : theme.colors.danger
              }
            />
          </View>
        </View>
        <View style={styles.section}>
          <CustomText variant="subheading">
            {t("analytics.monthlyBudgets")}
          </CustomText>
          <MonthlyBudgets />
        </View>
        <View style={styles.section}>
          <CustomText variant="subheading">
            {t("analytics.spendingDistribution")}
          </CustomText>

          <SpendingDonutChart items={spendingByCategory} />
        </View>
        <View style={styles.section}>
          <CustomText variant="subheading">
            {t("analytics.spendingByCategory")}
          </CustomText>

          <SpendingByCategory items={spendingByCategory} />
        </View>

        <View
          style={[
            styles.transactionCount,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <CustomText
            variant="body"
            style={{ color: theme.colors.textSecondary }}
          >
            {t("analytics.transactionCount")}
          </CustomText>

          <CustomText variant="heading">{summary.transactionCount}</CustomText>
        </View>

        {summary.transactionCount === 0 && (
          <View style={styles.emptyState}>
            <CustomText variant="subheading">
              {t("analytics.noTransactions")}
            </CustomText>
            <CustomText
              variant="body"
              style={{ color: theme.colors.textSecondary }}
            >
              {t("analytics.emptyDescription")}
            </CustomText>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
    gap: 28,
  },
  header: {
    gap: 6,
  },
  section: {
    gap: 14,
  },
  cards: {
    gap: 12,
  },
  transactionCount: {
    padding: 18,
    borderWidth: 1,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  emptyState: {
    alignItems: "center",
    gap: 8,
    paddingVertical: 24,
  },
});
