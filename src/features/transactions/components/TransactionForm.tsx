import { useTheme } from "@shopify/restyle";
import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

import { useAppState } from "@/core/providers/AppStateProvider";
import type { AppTheme } from "@/core/theme/restyle";
import { typography } from "@/core/theme/typography";
import CustomButton from "@/shared/components/CustomButton";
import CustomCard from "@/shared/components/CustomCard";
import CustomDatePicker from "@/shared/components/CustomDatePicker";
import CustomText from "@/shared/components/CustomText";
import { useCurrency } from "@/shared/hooks/useCurrency";
import { useTranslation } from "react-i18next";
import {
  getCategoriesByType,
  TRANSACTION_CATEGORIES,
} from "../constants/categories";
import type { TransactionType } from "../types/transaction.type";
export interface TransactionFormProps {
  mode: "add" | "edit";
  initialType?: TransactionType;
  initialAmount?: string;
  initialCategoryId?: string;
  initialNote?: string;
  initialDate?: Date;
  submitLabel: string;
  onSubmit: (transaction: {
    type: TransactionType;
    amount: number;
    categoryId: string;
    note?: string;
    date: Date;
  }) => void;
}

export default function TransactionForm({
  mode,
  initialType = "expense",
  initialAmount = "",
  initialCategoryId = "food_dining",
  initialNote = "",
  initialDate = new Date(),
  submitLabel,
  onSubmit,
}: TransactionFormProps) {
  const router = useRouter();
  const theme = useTheme<AppTheme>();
  const { t } = useTranslation();
  const { state } = useAppState();
  const { currency } = useCurrency();

  const [type, setType] = useState<TransactionType>(initialType);
  const [amount, setAmount] = useState(initialAmount);
  const [category, setCategory] = useState(initialCategoryId);
  const [date, setDate] = useState(initialDate);
  const [note, setNote] = useState(initialNote);
  const [error, setError] = useState("");

  const categories = getCategoriesByType(type, state.customCategories);
  const getCategoryLabel = (categoryId: string, name: string) => {
    const isBuiltInCategory = TRANSACTION_CATEGORIES.some(
      (category) => category.id === categoryId,
    );

    return isBuiltInCategory ? t(`categories.${categoryId}`) : name;
  };
  const inputStyle = [
    styles.input,
    {
      backgroundColor: theme.colors.background,
      borderColor: theme.colors.border,
      color: theme.colors.text,
    },
  ];

  const handleSave = () => {
    const trimmedAmount = amount.trim();

    if (!trimmedAmount) {
      setError(t("transactions.errorAmountRequired"));
      return;
    }

    if (!/^\d+(\.\d{1,2})?$/.test(trimmedAmount)) {
      setError(t("transactions.errorAmountInvalid"));
      return;
    }

    const numericAmount = Number(trimmedAmount);

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setError(t("transactions.errorAmountPositive"));
      return;
    }

    const selectedCategory = getCategoriesByType(
      type,
      state.customCategories,
    ).find((item) => item.id === category);

    if (!selectedCategory) {
      setError(t("transactions.errorCategoryRequired"));
      return;
    }

    setError("");

    onSubmit({
      type,
      amount: numericAmount,
      categoryId: category,
      note: note.trim() || undefined,
      date,
    });
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardContainer}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={styles.screenContainer}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode={
              Platform.OS === "ios" ? "interactive" : "on-drag"
            }
            showsVerticalScrollIndicator={false}
          >
            <CustomCard
              flex={1}
              backgroundColor="background"
              padding="lg"
              paddingTop="xxl"
            >
              <View style={styles.header}>
                <TouchableOpacity
                  onPress={() => router.back()}
                  accessibilityRole="button"
                  accessibilityLabel={t("transactions.goBack")}
                  style={styles.backButton}
                >
                  <ArrowLeft size={22} color={theme.colors.text} />
                </TouchableOpacity>

                <CustomText variant="title">
                  {mode === "add"
                    ? t("transactions.addTitle")
                    : t("transactions.edit")}
                </CustomText>

                <View style={styles.headerSpacer} />
              </View>

              <View style={styles.typeSelector}>
                {(["expense", "income"] as const).map((item) => {
                  const selected = type === item;

                  return (
                    <TouchableOpacity
                      key={item}
                      onPress={() => {
                        setType(item);
                        setCategory(
                          item === "expense" ? "food_dining" : "salary",
                        );
                        setError("");
                      }}
                      accessibilityRole="button"
                      accessibilityState={{ selected }}
                      style={[
                        styles.typeButton,
                        {
                          backgroundColor: selected
                            ? theme.colors.primary
                            : theme.colors.surface,
                          borderColor: theme.colors.border,
                        },
                      ]}
                    >
                      <CustomText
                        variant="body"
                        color={selected ? "surface" : "text"}
                      >
                        {item === "expense"
                          ? t("transactions.expense")
                          : t("transactions.income")}
                      </CustomText>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <CustomText variant="caption" marginTop="xl">
                {t("transactions.amountLabel") + " (" + currency + ")"}
              </CustomText>

              <View style={styles.amountContainer}>
                <CustomText variant="heading">{currency}</CustomText>

                <TextInput
                  accessibilityLabel={t("transactions.amountAccessibility")}
                  value={amount}
                  onChangeText={(value) => {
                    setAmount(value);
                    setError("");
                  }}
                  placeholder="0.00"
                  placeholderTextColor={theme.colors.textSecondary}
                  keyboardType="decimal-pad"
                  style={[
                    styles.amountInput,
                    {
                      color: theme.colors.text,
                      fontFamily: typography.bold,
                    },
                  ]}
                />
              </View>
              <CustomDatePicker
                value={date}
                onChange={setDate}
                maximumDate={new Date()}
              />
              <CustomText variant="caption" marginTop="lg">
                {t("transactions.category")}
              </CustomText>

              <View style={styles.categoryContainer}>
                {categories.map((item) => {
                  const selected = category === item.id;

                  return (
                    <TouchableOpacity
                      key={item.id}
                      onPress={() => {
                        setCategory(item.id);
                        setError("");
                      }}
                      accessibilityRole="button"
                      accessibilityState={{ selected }}
                      style={[
                        styles.categoryButton,
                        {
                          backgroundColor: selected
                            ? theme.colors.primaryLight
                            : theme.colors.surface,
                          borderColor: selected
                            ? theme.colors.primary
                            : theme.colors.border,
                        },
                      ]}
                    >
                      <CustomText
                        variant="caption"
                        color={selected ? "primary" : "textSecondary"}
                      >
                        {getCategoryLabel(item.id, item.name)}
                      </CustomText>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <CustomText variant="caption" marginTop="lg">
                {t("transactions.noteOptional")}
              </CustomText>

              <TextInput
                accessibilityLabel={t("transactions.noteAccessibility")}
                value={note}
                onChangeText={setNote}
                placeholder={t("transactions.notePlaceholder")}
                placeholderTextColor={theme.colors.textSecondary}
                style={[inputStyle, styles.noteInput]}
                multiline
                textAlignVertical="top"
              />

              {error ? (
                <CustomText variant="caption" color="danger" marginTop="md">
                  {error}
                </CustomText>
              ) : null}

              <View style={styles.footer}>
                <CustomButton
                  label={
                    mode === "add"
                      ? t("transactions.addButton")
                      : t("transactions.editButton")
                  }
                  onPress={handleSave}
                />
              </View>
            </CustomCard>
          </ScrollView>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "flex-start",
    justifyContent: "center",
  },
  headerSpacer: {
    width: 40,
  },
  typeSelector: {
    flexDirection: "row",
    gap: 12,
    marginTop: 28,
  },
  typeButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
  },
  amountContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 36,
    paddingVertical: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 16,
    marginTop: 8,
    fontFamily: typography.regular,
  },
  noteInput: {
    minHeight: 90,
  },
  keyboardContainer: {
    flex: 1,
  },
  screenContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  footer: {
    marginTop: "auto",
    paddingTop: 24,
  },
  categoryContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
  },
  categoryButton: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
});
