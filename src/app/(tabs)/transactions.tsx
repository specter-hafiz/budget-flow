import { useTheme } from "@shopify/restyle";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";

import { useAppState } from "@/core/providers/AppStateProvider";
import type { AppTheme } from "@/core/theme/restyle";
import { typography } from "@/core/theme/typography";
import {
  TRANSACTION_CATEGORIES,
  getCategoriesByType,
  getCategoryById,
} from "@/features/transactions/constants/categories";
import {
  ALL_CATEGORIES_FILTER,
  DEFAULT_TRANSACTION_FILTERS,
  type TransactionTypeFilter,
} from "@/features/transactions/types/transaction-filters.type";
import { filterTransactions } from "@/features/transactions/utils/filterTransactions";
import CustomCard from "@/shared/components/CustomCard";
import CustomText from "@/shared/components/CustomText";
import CustomTextInput from "@/shared/components/CustomTextInput";
import FilterBar from "@/shared/components/FilterBar";
import { useCurrency } from "@/shared/hooks/useCurrency";
import { useRouter } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { SafeAreaView } from "react-native-safe-area-context";
export default function TransactionsTab() {
  const { state } = useAppState();
  const { formatCurrency, formatDate } = useCurrency();
  const router = useRouter();
  const theme = useTheme<AppTheme>();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState(
    DEFAULT_TRANSACTION_FILTERS.searchQuery,
  );
  const [selectedType, setSelectedType] = useState<TransactionTypeFilter>(
    DEFAULT_TRANSACTION_FILTERS.selectedType,
  );

  const [selectedCategory, setSelectedCategory] = useState(
    DEFAULT_TRANSACTION_FILTERS.selectedCategory,
  );

  const getCategoryName = (categoryId: string) => {
    // Support transactions saved before we introduced stable category IDs.
    const category = getCategoryById(categoryId, state.customCategories);
    if (category) {
      const isBuiltInCategory = TRANSACTION_CATEGORIES.some(
        (item) => item.id === categoryId,
      );

      return isBuiltInCategory ? t(`categories.${categoryId}`) : category.name;
    }

    // Older transactions stored the category name directly.

    return categoryId;
  };

  const transactions = filterTransactions(state.transactions, {
    searchQuery,
    selectedType,
    selectedCategory,
  });

  const categories =
    selectedType === "all"
      ? [...TRANSACTION_CATEGORIES, ...state.customCategories]
      : getCategoriesByType(selectedType, state.customCategories);

  const categoryOptions = [
    { label: t("transactions.allCategories"), value: ALL_CATEGORIES_FILTER },
    ...categories.map((category) => ({
      label: TRANSACTION_CATEGORIES.some((item) => item.id === category.id)
        ? t(`categories.${category.id}`)
        : category.name,
      value: category.id,
    })),
  ];

  return (
    <SafeAreaView
      edges={["top"]}
      style={{
        flex: 1,
        backgroundColor: theme.colors.background,
      }}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <CustomText variant="heading">{t("transactions.title")}</CustomText>
          <CustomText variant="body" marginTop="sm">
            {t("transactions.subtitle")}
          </CustomText>
        </View>
        <CustomTextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder={t("transactions.searchPlaceholder")}
          accessibilityLabel={t("transactions.searchAccessibility")}
          returnKeyType="search"
          containerStyle={{ marginBottom: 20 }}
        />
        <FilterBar
          options={[
            { label: t("transactions.all"), value: "all" },
            { label: t("transactions.expenses"), value: "expense" },
            { label: t("transactions.income"), value: "income" },
          ]}
          selectedValue={selectedType}
          onSelect={(value) => {
            setSelectedType(value);
            setSelectedCategory(ALL_CATEGORIES_FILTER);
          }}
        />
        <FilterBar
          options={categoryOptions}
          selectedValue={selectedCategory}
          onSelect={setSelectedCategory}
          scrollable
        />

        {transactions.length === 0 ? (
          <CustomCard backgroundColor="surface" padding="lg">
            <CustomText variant="body">
              {t("transactions.emptyTitle")}
            </CustomText>
            <CustomText variant="caption" color="textSecondary" marginTop="sm">
              {t("transactions.emptyDescription")}
            </CustomText>
          </CustomCard>
        ) : (
          <View style={styles.list}>
            {transactions.map((transaction) => (
              <TouchableOpacity
                key={transaction.id}
                onPress={() => {
                  router.push({
                    pathname: "/transaction-details",
                    params: { id: transaction.id },
                  });
                }}
              >
                <CustomCard
                  key={transaction.id}
                  backgroundColor="surface"
                  padding="md"
                >
                  <View style={styles.row}>
                    <View style={styles.details}>
                      <CustomText variant="body">
                        {getCategoryName(transaction.categoryId)}
                      </CustomText>

                      <CustomText
                        variant="caption"
                        color="textSecondary"
                        marginTop="xs"
                      >
                        {transaction.type === "income"
                          ? t("transactions.income")
                          : t("transactions.expense")}
                        {" · "}
                        {formatDate(transaction.date)}
                      </CustomText>

                      {transaction.note ? (
                        <CustomText
                          variant="caption"
                          color="textSecondary"
                          marginTop="xs"
                        >
                          {transaction.note}
                        </CustomText>
                      ) : null}
                    </View>

                    <CustomText
                      variant="body"
                      style={{
                        fontFamily: typography.semiBold,
                        color:
                          transaction.type === "income"
                            ? theme.colors.success
                            : theme.colors.danger,
                      }}
                    >
                      {transaction.type === "income" ? "" : "−"}
                      {formatCurrency(transaction.amount)}
                    </CustomText>
                  </View>
                </CustomCard>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 20,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 24,
  },
  list: {
    gap: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  details: {
    flex: 1,
  },
});
