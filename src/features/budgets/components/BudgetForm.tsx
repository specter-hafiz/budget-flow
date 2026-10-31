import { useTheme } from "@shopify/restyle";
import { useMemo, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import { useAppState } from "@/core/providers/AppStateProvider";
import type { AppTheme } from "@/core/theme/restyle";
import {
  getCategoriesByType,
  TRANSACTION_CATEGORIES,
} from "@/features/transactions/constants/categories";
import CustomButton from "@/shared/components/CustomButton";
import CustomText from "@/shared/components/CustomText";
import CustomTextInput from "@/shared/components/CustomTextInput";
import { useCurrency } from "@/shared/hooks/useCurrency";
import { useTranslation } from "react-i18next";
import { Budget } from "../types/budget.type";
type BudgetFormProps = {
  onSubmit: (categoryId: string, amount: number) => void;
  onCancel?: () => void;
  existingCategoryIds?: string[];
  initialBudget?: Budget;
};

export default function BudgetForm({
  onSubmit,
  onCancel,
  existingCategoryIds = [],
  initialBudget,
}: BudgetFormProps) {
  const theme = useTheme<AppTheme>();
  const { state } = useAppState();
  const { currency } = useCurrency();
  const { t } = useTranslation();
  const categories = useMemo(
    () =>
      getCategoriesByType("expense", state.customCategories).filter(
        (category) =>
          category.id === initialBudget?.categoryId ||
          !existingCategoryIds.includes(category.id),
      ),
    [existingCategoryIds, initialBudget?.categoryId, state.customCategories],
  );
  const getCategoryLabel = (categoryId: string, name: string) => {
    const isBuiltInCategory = TRANSACTION_CATEGORIES.some(
      (category) => category.id === categoryId,
    );

    return isBuiltInCategory ? t(`categories.${categoryId}`) : name;
  };
  const [categoryId, setCategoryId] = useState(initialBudget?.categoryId ?? "");
  const [amountText, setAmountText] = useState(
    initialBudget ? String(initialBudget.amount) : "",
  );
  const [error, setError] = useState("");

  const handleSubmit = () => {
    const amount = Number(amountText.trim());

    if (!categoryId) {
      setError(t("budget.selectCategoryError"));
      return;
    }

    if (!amountText.trim() || !Number.isFinite(amount) || amount <= 0) {
      setError(t("budget.invalidAmountError"));
      return;
    }

    setError("");
    onSubmit(categoryId, amount);
  };

  return (
    <View style={styles.container}>
      <CustomText variant="subheading">{t("budget.category")}</CustomText>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categories}
        keyboardShouldPersistTaps="handled"
      >
        {categories.map((category) => {
          const selected = category.id === categoryId;

          return (
            <View key={category.id} style={styles.categoryItem}>
              <CustomButton
                label={getCategoryLabel(category.id, category.name)}
                onPress={() => {
                  setCategoryId(category.id);
                  setError("");
                }}
                variant={selected ? "primary" : "secondary"}
              />
            </View>
          );
        })}
      </ScrollView>

      {categories.length === 0 && (
        <CustomText
          variant="body"
          style={{ color: theme.colors.textSecondary }}
        >
          {t("budget.noCategories")}
        </CustomText>
      )}

      <CustomText variant="subheading">
        {t("budget.monthlyLimit")} ({currency})
      </CustomText>

      <CustomTextInput
        value={amountText}
        onChangeText={setAmountText}
        placeholder="1500"
        keyboardType="decimal-pad"
      />

      {!!error && (
        <CustomText variant="body" style={{ color: theme.colors.danger }}>
          {error}
        </CustomText>
      )}

      <View style={styles.actions}>
        {onCancel && (
          <CustomButton
            label={t("budget.cancel")}
            onPress={onCancel}
            variant="secondary"
          />
        )}

        <CustomButton
          label={initialBudget ? t("budget.update") : t("budget.save")}
          onPress={handleSubmit}
          disabled={categories.length === 0}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 14,
  },
  categories: {
    gap: 8,
    paddingVertical: 4,
  },
  categoryItem: {
    flexShrink: 0,
  },
  actions: {
    gap: 10,
  },
});
