import { useTheme } from "@shopify/restyle";
import { useEffect, useMemo, useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";

import type { AppTheme } from "@/core/theme/restyle";
import type { CategorySpending } from "@/features/analytics/utils/calculateSpendingByCategory";
import { TRANSACTION_CATEGORIES } from "@/features/transactions/constants/categories";
import CustomText from "@/shared/components/CustomText";
import { useCurrency } from "@/shared/hooks/useCurrency";
import { useTranslation } from "react-i18next";

interface SpendingDonutChartProps {
  items: CategorySpending[];
}

const SIZE = 220;
const CENTER = SIZE / 2;
const RADIUS = 78;
const STROKE_WIDTH = 28;

const SLICE_COLORS = [
  "#2E7D32",
  "#1976D2",
  "#F9A825",
  "#8E24AA",
  "#00897B",
  "#EF6C00",
  "#5C6BC0",
  "#D81B60",
  "#546E7A",
  "#7CB342",
  "#6D4C41",
];

function polarToCartesian(
  centerX: number,
  centerY: number,
  radius: number,
  angleInDegrees: number,
) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180;

  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}

function createArcPath(startAngle: number, endAngle: number) {
  const start = polarToCartesian(CENTER, CENTER, RADIUS, startAngle);
  const end = polarToCartesian(CENTER, CENTER, RADIUS, endAngle);
  const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;

  return [
    `M ${start.x} ${start.y}`,
    `A ${RADIUS} ${RADIUS} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`,
  ].join(" ");
}

export default function SpendingDonutChart({ items }: SpendingDonutChartProps) {
  const theme = useTheme<AppTheme>();
  const { formatCurrency } = useCurrency();
  const { t } = useTranslation();
  const getCategoryLabel = (categoryId: string, name: string) => {
    const isBuiltInCategory = TRANSACTION_CATEGORIES.some(
      (category) => category.id === categoryId,
    );

    return isBuiltInCategory ? t(`categories.${categoryId}`) : name;
  };
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null,
  );
  const totalExpenses = useMemo(
    () => items.reduce((sum, item) => sum + item.total, 0),
    [items],
  );

  useEffect(() => {
    setSelectedCategoryId(null);
  }, [items]);

  let currentAngle = 0;

  return (
    <View style={styles.container}>
      {items.length === 0 || totalExpenses <= 0 ? (
        <View style={styles.emptyState}>
          <CustomText variant="body" color="textSecondary">
            {t("analytics.noChartExpenses")}
          </CustomText>
        </View>
      ) : (
        <>
          <View style={styles.chartContainer}>
            <Svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
              <Circle
                cx={CENTER}
                cy={CENTER}
                r={RADIUS}
                fill="none"
                stroke={theme.colors.border}
                strokeWidth={STROKE_WIDTH}
              />

              {items.map((item, index) => {
                const sweepAngle = (item.total / totalExpenses) * 359.9;
                const startAngle = currentAngle;
                const endAngle = currentAngle + sweepAngle;
                currentAngle = endAngle;

                return (
                  <Path
                    key={item.categoryId}
                    onPress={() => setSelectedCategoryId(item.categoryId)}
                    accessibilityLabel={`${getCategoryLabel(item.categoryId, item.categoryName)}, ${item.percentage.toFixed(1)}%`}
                    d={createArcPath(startAngle, endAngle)}
                    fill="none"
                    stroke={SLICE_COLORS[index % SLICE_COLORS.length]}
                    strokeWidth={STROKE_WIDTH}
                    strokeLinecap="butt"
                  />
                );
              })}

              <Circle
                cx={CENTER}
                cy={CENTER}
                r={RADIUS - STROKE_WIDTH / 2}
                fill={theme.colors.surface}
              />
            </Svg>

            <View style={styles.centerLabel}>
              <CustomText variant="caption" color="textSecondary">
                {items.find((item) => item.categoryId === selectedCategoryId)
                  ? getCategoryLabel(
                      items.find(
                        (item) => item.categoryId === selectedCategoryId,
                      )!.categoryId,
                      items.find(
                        (item) => item.categoryId === selectedCategoryId,
                      )!.categoryName,
                    )
                  : t("analytics.totalExpensesLabel")}
              </CustomText>

              <CustomText variant="subheading">
                {formatCurrency(
                  items.find((item) => item.categoryId === selectedCategoryId)
                    ?.total ?? totalExpenses,
                )}
              </CustomText>

              <CustomText variant="caption" color="textSecondary">
                {items.find((item) => item.categoryId === selectedCategoryId)
                  ? `${items.find((item) => item.categoryId === selectedCategoryId)!.percentage.toFixed(1)}${t("analytics.expensesSuffix")}`
                  : t("analytics.allCategories")}
              </CustomText>
            </View>
            {selectedCategoryId !== null && (
              <TouchableOpacity
                onPress={() => setSelectedCategoryId(null)}
                accessibilityRole="button"
                accessibilityLabel={t("analytics.showAllCategories")}
                style={styles.clearSelection}
              >
                <CustomText variant="caption" color="primary">
                  {t("analytics.showAll")}
                </CustomText>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.legend}>
            {items.map((item, index) => (
              <View key={item.categoryId} style={styles.legendRow}>
                <View
                  style={[
                    styles.legendDot,
                    {
                      backgroundColor:
                        SLICE_COLORS[index % SLICE_COLORS.length],
                    },
                  ]}
                />

                <View style={styles.legendText}>
                  <CustomText variant="body">
                    {getCategoryLabel(item.categoryId, item.categoryName)}
                  </CustomText>
                </View>

                <CustomText variant="caption" color="textSecondary">
                  {item.percentage.toFixed(1)}%
                </CustomText>
              </View>
            ))}
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: 24,
  },
  clearSelection: {
    position: "absolute",
    bottom: 55,
    alignSelf: "center",
  },
  chartContainer: {
    width: SIZE,
    height: SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
  centerLabel: {
    position: "absolute",
    alignItems: "center",
    paddingHorizontal: 8,
  },
  legend: {
    width: "100%",
    gap: 14,
  },
  legendRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    flex: 1,
  },
  emptyState: {
    paddingVertical: 24,
    alignItems: "center",
  },
});
