import { useTheme } from "@shopify/restyle";
import { router } from "expo-router";
import {
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

import { useAppState } from "@/core/providers/AppStateProvider";
import type { AppTheme } from "@/core/theme/restyle";
import { typography } from "@/core/theme/typography";
import {
  getCategoryById,
  TRANSACTION_CATEGORIES,
} from "@/features/transactions/constants/categories";
import CustomButton from "@/shared/components/CustomButton";
import CustomCard from "@/shared/components/CustomCard";
import CustomText from "@/shared/components/CustomText";
import { useCurrency } from "@/shared/hooks/useCurrency";
import { PersonStanding } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { SafeAreaView } from "react-native-safe-area-context";
export function DashboardScreen() {
  const { state } = useAppState();
  const { formatCurrency, formatDate } = useCurrency();
  const theme = useTheme<AppTheme>();
  const { t } = useTranslation();
  const profile = state.profile;
  const transactions = state.transactions;
  const AVATAR_SIZE = 60;

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

  // Calculate totals from the transactions already in global state.
  const totalIncome = transactions.reduce(
    (total, transaction) =>
      transaction.type === "income" ? total + transaction.amount : total,
    0,
  );

  const totalExpenses = transactions.reduce(
    (total, transaction) =>
      transaction.type === "expense" ? total + transaction.amount : total,
    0,
  );

  const balance = totalIncome - totalExpenses;
  const recentTransactions = transactions.slice(0, 4);

  return (
    <SafeAreaView
      edges={["top"]}
      style={{ flex: 1, backgroundColor: theme.colors.background }}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.welcome}>
          {profile?.photoUri ? (
            <Image
              source={{ uri: profile.photoUri }}
              style={styles.profileImage}
            />
          ) : (
            <View
              style={{
                width: AVATAR_SIZE,
                height: AVATAR_SIZE,
                borderRadius: AVATAR_SIZE / 2,
                backgroundColor: theme.colors.primaryLight,
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
              }}
            >
              <PersonStanding
                size={AVATAR_SIZE * 0.45}
                color={theme.colors.primary}
              />
            </View>
          )}

          <View style={{ flexShrink: 1 }}>
            <CustomText variant="heading" numberOfLines={1}>
              {t("dashboard.welcome", {
                name: profile?.name ?? t("dashboard.welcomeFallback"),
              })}
            </CustomText>

            <CustomText variant="body" marginTop="sm">
              {t("dashboard.subtitle")}
            </CustomText>
          </View>
        </View>

        <CustomCard backgroundColor="surface" padding="lg">
          <CustomText variant="caption" color="textSecondary">
            {t("dashboard.totalBalance")}
          </CustomText>

          <CustomText
            variant="heading"
            style={{
              marginTop: 8,
              fontFamily: typography.bold,
              color: theme.colors.text,
            }}
          >
            {formatCurrency(balance)}
          </CustomText>

          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <CustomText variant="caption" color="textSecondary">
                {t("dashboard.income")}
              </CustomText>
              <CustomText
                variant="body"
                style={{
                  marginTop: 6,
                  fontFamily: typography.semiBold,
                  color: theme.colors.success,
                }}
              >
                {formatCurrency(totalIncome)}
              </CustomText>
            </View>

            <View style={styles.summaryItem}>
              <CustomText variant="caption" color="textSecondary">
                {t("dashboard.expenses")}
              </CustomText>
              <CustomText
                variant="body"
                style={{
                  marginTop: 6,
                  fontFamily: typography.semiBold,
                  color: theme.colors.danger,
                }}
              >
                {formatCurrency(totalExpenses)}
              </CustomText>
            </View>
          </View>
        </CustomCard>

        <View style={styles.sectionHeader}>
          <CustomText variant="title">
            {t("dashboard.recentTransactions")}
          </CustomText>
          <CustomButton
            label={t("dashboard.viewAll")}
            onPress={() => router.push("/(tabs)/transactions")}
          />
        </View>

        {recentTransactions.length === 0 ? (
          <CustomCard backgroundColor="surface" padding="lg">
            <CustomText variant="body">
              {t("dashboard.noTransactions")}
            </CustomText>
            <CustomText variant="caption" color="textSecondary" marginTop="sm">
              {t("dashboard.emptyDescription")}
            </CustomText>
          </CustomCard>
        ) : (
          <View style={styles.transactionList}>
            {recentTransactions.map((transaction) => (
              <TouchableOpacity
                key={transaction.id}
                onPress={() => {
                  router.push({
                    pathname: "/transaction-details",
                    params: { id: transaction.id },
                  });
                }}
              >
                <CustomCard backgroundColor="surface" padding="md">
                  <View style={styles.transactionRow}>
                    <View style={styles.transactionDetails}>
                      <CustomText variant="body">
                        {getCategoryName(transaction.categoryId)}
                      </CustomText>

                      <CustomText
                        variant="caption"
                        color="textSecondary"
                        marginTop="xs"
                      >
                        {formatDate(transaction.date)}
                      </CustomText>
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
                      {transaction.type === "income" ? "+" : "−"}
                      {formatCurrency(transaction.amount)}
                    </CustomText>
                  </View>
                </CustomCard>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* <CustomButton
          label="Add Transaction"
          onPress={() => router.push("/add-transaction")}
        />

        <CustomButton
          label="Reset onboarding (testing)"
          onPress={() => {
            dispatch({ type: "RESET_ONBOARDING" });
            router.replace("/");
          }}
        /> */}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 20,
    paddingBottom: 32,
    gap: 20,
  },
  welcome: {
    flex: 1,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 40,
    // marginBottom: 16,
  },
  summaryRow: {
    flexDirection: "row",
    marginTop: 24,
    gap: 16,
  },
  summaryItem: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  transactionList: {
    gap: 12,
  },
  transactionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  transactionDetails: {
    flex: 1,
  },
});
