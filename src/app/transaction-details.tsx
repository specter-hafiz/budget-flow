import { useTheme } from "@shopify/restyle";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAppState } from "@/core/providers/AppStateProvider";
import type { AppTheme } from "@/core/theme/restyle";
import { typography } from "@/core/theme/typography";
import {
  getCategoryById,
  TRANSACTION_CATEGORIES,
} from "@/features/transactions/constants/categories";
import ConfirmationDialog from "@/shared/components/ConfirmationDialog";
import CustomButton from "@/shared/components/CustomButton";
import CustomCard from "@/shared/components/CustomCard";
import CustomText from "@/shared/components/CustomText";
import { useCurrency } from "@/shared/hooks/useCurrency";
import { useState } from "react";
import { useTranslation } from "react-i18next";
export default function TransactionDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { state, dispatch } = useAppState();
  const { formatCurrency, formatDate } = useCurrency();
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const theme = useTheme<AppTheme>();
  const { t } = useTranslation();

  const transaction = state.transactions.find((item) => item.id === id);

  if (!transaction) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
        edges={["top"]}
      >
        <View style={styles.content}>
          <CustomText variant="heading">
            {t("transactions.notFound")}
          </CustomText>
          <CustomText variant="body" marginTop="sm">
            {t("transactions.deletedMessage")}
          </CustomText>
          <CustomButton
            label={t("transactions.goBack")}
            onPress={() => router.back()}
          />
        </View>
      </SafeAreaView>
    );
  }

  const category = getCategoryById(
    transaction.categoryId,
    state.customCategories,
  );

  const isBuiltInCategory = category
    ? TRANSACTION_CATEGORIES.some((item) => item.id === category.id)
    : false;

  const categoryName = category
    ? isBuiltInCategory
      ? t(`categories.${category.id}`)
      : category.name
    : transaction.categoryId;
  const isIncome = transaction.type === "income";
  const handleDelete = () => {
    setShowDeleteConfirmation(true);
  };
  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={["top"]}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <CustomText variant="heading">
          {t("transactions.detailsTitle")}
        </CustomText>

        <CustomCard backgroundColor="surface" padding="lg">
          <CustomText variant="caption" color="textSecondary">
            {isIncome ? t("transactions.income") : t("transactions.expense")}
          </CustomText>

          <CustomText
            variant="heading"
            style={{
              color: isIncome ? theme.colors.success : theme.colors.danger,
              fontFamily: typography.bold,
            }}
            marginTop="sm"
          >
            {isIncome ? "" : "−"}
            {formatCurrency(transaction.amount)}
          </CustomText>

          <View style={styles.divider} />

          <CustomText variant="caption" color="textSecondary">
            {t("transactions.category")}
          </CustomText>
          <CustomText variant="body" marginTop="xs">
            {categoryName}
          </CustomText>

          <CustomText variant="caption" color="textSecondary" marginTop="lg">
            {t("transactions.date")}
          </CustomText>
          <CustomText variant="body" marginTop="xs">
            {formatDate(transaction.date)}
          </CustomText>

          <CustomText variant="caption" color="textSecondary" marginTop="lg">
            {t("transactions.note")}
          </CustomText>
          <CustomText variant="body" marginTop="xs">
            {transaction.note || t("transactions.noNote")}
          </CustomText>
        </CustomCard>
        <CustomButton
          label={t("transactions.edit")}
          onPress={() =>
            router.push({
              pathname: "/edit-transaction",
              params: { id: transaction.id },
            })
          }
        />
        <CustomButton label={t("transactions.delete")} onPress={handleDelete} />
        <CustomButton
          label={t("transactions.backToTransactions")}
          onPress={() => router.back()}
        />
        <ConfirmationDialog
          title={t("transactions.deleteConfirmationTitle")}
          message={t("transactions.deleteConfirmationMessage")}
          visible={showDeleteConfirmation}
          confirmLabel={t("transactions.deleteConfirm")}
          cancelLabel={t("transactions.cancel")}
          onCancel={() => setShowDeleteConfirmation(false)}
          onConfirm={() => {
            dispatch({
              type: "DELETE_TRANSACTION",
              payload: transaction.id,
            });
            setShowDeleteConfirmation(false);
            router.replace("/(tabs)/transactions");
          }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 32,
    gap: 20,
  },
  divider: {
    height: 1,
    backgroundColor: "#E2E8F0",
    marginVertical: 20,
  },
});
