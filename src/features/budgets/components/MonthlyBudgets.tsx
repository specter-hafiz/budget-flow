import { useTheme } from "@shopify/restyle";
import { useMemo, useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

import { useAppState } from "@/core/providers/AppStateProvider";
import type { AppTheme } from "@/core/theme/restyle";
import { getMonthlyBudgetsProgress } from "@/features/budgets/utils/getMonthlyBudgetsProgress";
import {
  getCategoryById,
  TRANSACTION_CATEGORIES,
} from "@/features/transactions/constants/categories";
import ConfirmationDialog from "@/shared/components/ConfirmationDialog";
import CustomButton from "@/shared/components/CustomButton";
import CustomText from "@/shared/components/CustomText";
import { useCurrency } from "@/shared/hooks/useCurrency";
import { useTranslation } from "react-i18next";
import { Budget } from "../types/budget.type";
import { calculateMonthlyBudgetSummary } from "../utils/calculateMonthlyBudgetSummary";
import BudgetForm from "./BudgetForm";

export default function MonthlyBudgets() {
  const theme = useTheme<AppTheme>();
  const { state, dispatch } = useAppState();
  const { formatCurrency } = useCurrency();
  const { t, i18n } = useTranslation();
  const getCategoryLabel = (categoryId: string, name: string) => {
    const isBuiltInCategory = TRANSACTION_CATEGORIES.some(
      (category) => category.id === categoryId,
    );

    return isBuiltInCategory ? t(`categories.${categoryId}`) : name;
  };
  const [budgetToDelete, setBudgetToDelete] = useState<Budget | null>(null);

  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();

    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });

  const monthLabel = useMemo(() => {
    const [year, month] = selectedMonth.split("-").map(Number);

    return new Date(year, month - 1, 1).toLocaleDateString(
      i18n.language === "fr"
        ? "fr-FR"
        : i18n.language === "es"
          ? "es-ES"
          : i18n.language === "pt"
            ? "pt-PT"
            : "en-GH",
      {
        month: "long",
        year: "numeric",
      },
    );
  }, [selectedMonth, i18n.language]);

  const changeMonth = (offset: number) => {
    const [year, month] = selectedMonth.split("-").map(Number);
    const date = new Date(year, month - 1 + offset, 1);

    setSelectedMonth(
      `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`,
    );
  };

  const [showForm, setShowForm] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);

  const existingCategoryIds = useMemo(
    () =>
      state.budgets
        .filter((budget) => budget.month === selectedMonth)
        .map((budget) => budget.categoryId),
    [state.budgets, selectedMonth],
  );

  const handleSaveBudget = (categoryId: string, amount: number) => {
    const now = new Date().toISOString();
    if (editingBudget) {
      dispatch({
        type: "UPDATE_BUDGET",
        payload: {
          ...editingBudget,
          categoryId,
          amount,
        },
      });
    } else {
      dispatch({
        type: "ADD_BUDGET",
        payload: {
          id: `${selectedMonth}-${categoryId}`,
          categoryId,
          amount,
          month: selectedMonth,
          createdAt: now,
        },
      });
    }

    setShowForm(false);
    setEditingBudget(null);
  };

  const budgets = useMemo(
    () =>
      getMonthlyBudgetsProgress(
        state.budgets,
        state.transactions,
        selectedMonth,
      ),
    [state.budgets, state.transactions, selectedMonth],
  );

  const summary = useMemo(
    () => calculateMonthlyBudgetSummary(budgets),
    [budgets],
  );

  const budgetUtilization = useMemo(
    () =>
      summary.totalBudget > 0
        ? (summary.totalSpent / summary.totalBudget) * 100
        : 0,
    [summary.totalBudget, summary.totalSpent],
  );

  return (
    <View style={styles.container}>
      <View style={styles.monthNavigation}>
        <CustomButton
          label={t("budget.previous")}
          variant="secondary"
          onPress={() => changeMonth(-1)}
        />

        <CustomText variant="subheading">{monthLabel}</CustomText>

        <CustomButton
          label={t("budget.next")}
          variant="secondary"
          onPress={() => changeMonth(1)}
        />
      </View>
      <CustomButton
        label={t("budget.currentMonth")}
        variant="secondary"
        onPress={() => {
          const now = new Date();

          setSelectedMonth(
            `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`,
          );
        }}
      />

      <CustomButton
        label={t("budget.create")}
        onPress={() => setShowForm(true)}
      />
      <View style={styles.summaryContainer}>
        <View
          style={[
            styles.summaryCard,
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
            {t("budget.totalBudget")}
          </CustomText>
          <CustomText variant="subheading">
            {formatCurrency(summary.totalBudget)}
          </CustomText>
        </View>

        <View
          style={[
            styles.summaryCard,
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
            {t("budget.totalSpent")}
          </CustomText>
          <CustomText variant="subheading">
            {formatCurrency(summary.totalSpent)}
          </CustomText>
        </View>

        <View
          style={[
            styles.summaryCard,
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
            {t("budget.availableBudget")}
          </CustomText>
          <CustomText
            variant="subheading"
            style={{
              color:
                summary.availableBudget < 0
                  ? theme.colors.danger
                  : theme.colors.success,
            }}
          >
            {formatCurrency(summary.availableBudget)}
          </CustomText>
        </View>
        <View
          style={[
            styles.summaryCard,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <View style={styles.row}>
            <CustomText variant="subheading">
              {t("budget.utilization")}
            </CustomText>
            <CustomText
              variant="subheading"
              style={{
                color:
                  budgetUtilization > 100
                    ? theme.colors.danger
                    : budgetUtilization >= 80
                      ? theme.colors.warning
                      : theme.colors.success,
              }}
            >
              {Math.round(budgetUtilization)}%
            </CustomText>
          </View>

          <View
            style={[
              styles.progressTrack,
              { backgroundColor: theme.colors.border },
            ]}
          >
            <View
              style={[
                styles.progressFill,
                {
                  width: `${Math.min(budgetUtilization, 100)}%`,
                  backgroundColor:
                    budgetUtilization > 100
                      ? theme.colors.danger
                      : budgetUtilization >= 80
                        ? theme.colors.warning
                        : theme.colors.success,
                },
              ]}
            />
          </View>

          <CustomText
            variant="body"
            style={{ color: theme.colors.textSecondary }}
          >
            {t("budget.spentOutOf", {
              spent: formatCurrency(summary.totalSpent),
              total: formatCurrency(summary.totalBudget),
            })}
          </CustomText>
        </View>
      </View>
      <Modal
        visible={showForm}
        transparent
        animationType="fade"
        onRequestClose={() => setShowForm(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            onPress={() => setShowForm(false)}
            accessibilityLabel={t("budget.close")}
          />

          <View
            style={[
              styles.dialog,
              { backgroundColor: theme.colors.background },
            ]}
          >
            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.dialogHeader}>
                <CustomText variant="heading">{t("budget.create")}</CustomText>

                <CustomButton
                  label={t("budget.close")}
                  variant="secondary"
                  onPress={() => setShowForm(false)}
                />
              </View>

              <BudgetForm
                onSubmit={handleSaveBudget}
                existingCategoryIds={existingCategoryIds}
                onCancel={() => {
                  setShowForm(false);
                  setEditingBudget(null);
                }}
                initialBudget={editingBudget ?? undefined}
              />
            </ScrollView>
          </View>
        </View>
      </Modal>
      {budgets.length === 0 ? (
        <View
          style={[
            styles.emptyCard,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <CustomText variant="body">{t("budget.emptyTitle")}</CustomText>

          <CustomText
            variant="body"
            style={{ color: theme.colors.textSecondary }}
          >
            {t("budget.emptyDescription")}
          </CustomText>
        </View>
      ) : (
        budgets.map(({ budget, spent, remaining, percentageUsed }) => {
          const progress = Math.min(percentageUsed / 100, 1);
          const isOverBudget = percentageUsed > 100;
          const isNearLimit = percentageUsed >= 80 && !isOverBudget;

          const progressColor = isOverBudget
            ? theme.colors.danger
            : isNearLimit
              ? theme.colors.warning
              : theme.colors.success;

          return (
            <View
              key={budget.id}
              style={[
                styles.budgetCard,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                },
              ]}
            >
              <View style={styles.row}>
                <CustomText variant="subheading">
                  {(() => {
                    const category = getCategoryById(
                      budget.categoryId,
                      state.customCategories,
                    );

                    return category
                      ? getCategoryLabel(category.id, category.name)
                      : t("budget.unknownCategory");
                  })()}
                </CustomText>

                <View style={styles.cardActions}>
                  <CustomText
                    variant="body"
                    style={{ color: theme.colors.textSecondary }}
                  >
                    {Math.round(percentageUsed)}%
                  </CustomText>

                  <CustomButton
                    label={t("budget.edit")}
                    variant="secondary"
                    onPress={() => {
                      setEditingBudget(budget);
                      setShowForm(true);
                    }}
                  />
                  <CustomButton
                    label={t("budget.delete")}
                    variant="secondary"
                    onPress={() => setBudgetToDelete(budget)}
                  />
                </View>
              </View>

              <View style={styles.row}>
                <CustomText variant="body">
                  {formatCurrency(spent)} {t("budget.spent")}
                </CustomText>

                <CustomText
                  variant="body"
                  style={{ color: theme.colors.textSecondary }}
                >
                  {t("budget.of")} {formatCurrency(budget.amount)}
                </CustomText>
              </View>

              <View
                style={[
                  styles.progressTrack,
                  { backgroundColor: theme.colors.border },
                ]}
              >
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${progress * 100}%`,
                      backgroundColor: progressColor,
                    },
                  ]}
                />
              </View>

              <CustomText
                variant="body"
                style={{
                  color: isOverBudget
                    ? theme.colors.danger
                    : theme.colors.textSecondary,
                }}
              >
                {isOverBudget
                  ? `${formatCurrency(Math.abs(remaining))} ${t("budget.overBudget")}`
                  : isNearLimit
                    ? `${formatCurrency(remaining)} ${t("budget.remaining")} · ${t("budget.nearLimit")}`
                    : `${formatCurrency(remaining)} ${t("budget.remaining")}`}
              </CustomText>
            </View>
          );
        })
      )}
      <ConfirmationDialog
        visible={budgetToDelete !== null}
        title={t("budget.deleteTitle")}
        message={t("budget.deleteMessage")}
        confirmLabel={t("budget.delete")}
        cancelLabel={t("budget.cancel")}
        onCancel={() => {
          setBudgetToDelete(null);
        }}
        onConfirm={() => {
          if (!budgetToDelete) return;
          dispatch({
            type: "DELETE_BUDGET",
            payload: budgetToDelete.id,
          });
          setBudgetToDelete(null);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  emptyCard: {
    padding: 18,
    borderWidth: 1,
    borderRadius: 16,
    gap: 8,
  },
  budgetCard: {
    padding: 16,
    borderWidth: 1,
    borderRadius: 16,
    gap: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  progressTrack: {
    height: 8,
    borderRadius: 999,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  dialog: {
    width: "100%",
    maxWidth: 480,
    maxHeight: "85%",
    padding: 20,
    borderRadius: 20,
  },
  dialogHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
    gap: 12,
  },
  cardActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  monthNavigation: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  summaryContainer: {
    gap: 10,
  },
  summaryCard: {
    padding: 16,
    borderWidth: 1,
    borderRadius: 16,
    gap: 6,
  },
});
