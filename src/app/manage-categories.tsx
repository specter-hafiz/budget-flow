import { useTheme } from "@shopify/restyle";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, Modal, ScrollView, View } from "react-native";

import { useAppState } from "@/core/providers/AppStateProvider";
import { AppTheme } from "@/core/theme/restyle";
import {
  CategoryType,
  TRANSACTION_CATEGORIES,
} from "@/features/transactions/constants/categories";
import ConfirmationDialog from "@/shared/components/ConfirmationDialog";
import CustomButton from "@/shared/components/CustomButton";
import CustomCard from "@/shared/components/CustomCard";
import CustomText from "@/shared/components/CustomText";
import CustomTextInput from "@/shared/components/CustomTextInput";
import { useTranslation } from "react-i18next";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ManageCategoriesScreen() {
  const theme = useTheme<AppTheme>();
  const [selectedType, setSelectedType] = useState<CategoryType>("expense");
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [categoryError, setCategoryError] = useState("");
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(
    null,
  );
  const [deletingCategoryId, setDeletingCategoryId] = useState<string | null>(
    null,
  );
  const [isDeleteDialogVisible, setIsDeleteDialogVisible] = useState(false);
  const { state, dispatch } = useAppState();
  const { t } = useTranslation();
  const handleSaveCategory = () => {
    const name = categoryName.trim();

    if (!name) {
      setCategoryError(t("manageCategories.nameRequired"));
      return;
    }

    const allCategories = [
      ...TRANSACTION_CATEGORIES,
      ...state.customCategories,
    ];

    const duplicateCategory = allCategories.some(
      (category) =>
        category.id !== editingCategoryId &&
        category.type === selectedType &&
        category.name.toLowerCase() === name.toLowerCase(),
    );
    if (duplicateCategory) {
      setCategoryError(t("manageCategories.duplicateCategory"));
      return;
    }

    if (editingCategoryId) {
      const existingCategory = state.customCategories.find(
        (category) => category.id === editingCategoryId,
      );

      if (!existingCategory) {
        setCategoryError(t("manageCategories.categoryNotFound"));
        return;
      }
      dispatch({
        type: "UPDATE_CUSTOM_CATEGORY",
        payload: {
          ...existingCategory,
          name,
          type: selectedType,
        },
      });
    } else {
      dispatch({
        type: "ADD_CUSTOM_CATEGORY",
        payload: {
          id: `custom_${Date.now().toString()}`,
          name: name,
          type: selectedType,
        },
      });
    }

    setCategoryName("");
    setCategoryError("");
    setEditingCategoryId(null);
    setIsCreatingCategory(false);
  };

  const handleDeleteCategory = () => {
    if (!deletingCategoryId) {
      return;
    }

    dispatch({
      type: "DELETE_CUSTOM_CATEGORY",
      payload: deletingCategoryId,
    });

    setDeletingCategoryId(null);
    setIsDeleteDialogVisible(false);
  };

  const getCategoryName = (categoryId: string, categoryName: string) => {
    const isBuiltInCategory = TRANSACTION_CATEGORIES.some(
      (category) => category.id === categoryId,
    );

    return isBuiltInCategory ? t(`categories.${categoryId}`) : categoryName;
  };

  const handleRequestDelete = (categoryId: string) => {
    const transactionCount = state.transactions.filter(
      (transaction) => transaction.categoryId === categoryId,
    ).length;

    const budgetCount = state.budgets.filter(
      (budget) => budget.categoryId === categoryId,
    ).length;

    if (transactionCount > 0 || budgetCount > 0) {
      Alert.alert(
        t("manageCategories.categoryInUse"),
        t("manageCategories.categoryInUseMessage", {
          transactions: transactionCount,
          budgets: budgetCount,
        }),
        [{ text: t("manageCategories.ok") }],
      );

      return;
    }

    setDeletingCategoryId(categoryId);
    setIsDeleteDialogVisible(true);
  };
  const categories = [
    ...state.customCategories,
    ...TRANSACTION_CATEGORIES,
  ].filter((category) => category.type === selectedType);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView
        contentContainerStyle={{
          padding: theme.spacing.lg,
          gap: theme.spacing.md,
        }}
      >
        <CustomButton
          label={t("manageCategories.back")}
          onPress={() => router.back()}
        />

        <CustomText variant="heading">{t("manageCategories.title")}</CustomText>
        <CustomText variant="body">{t("manageCategories.subtitle")}</CustomText>
        <CustomButton
          label={t("manageCategories.create")}
          onPress={() => setIsCreatingCategory(true)}
        />
        <CustomText variant="subheading">
          {t("manageCategories.categoryType")}
        </CustomText>

        <CustomCard
          style={{
            flexDirection: "row",
            gap: theme.spacing.md,
          }}
        >
          <CustomButton
            style={{ flex: 1 }}
            label={
              selectedType === "expense"
                ? ` ${t("manageCategories.expense")} ✓`
                : t("manageCategories.expense")
            }
            onPress={() => setSelectedType("expense")}
          />

          <CustomButton
            style={{ flex: 1 }}
            label={
              selectedType === "income"
                ? `${t("manageCategories.income")}✓`
                : t("manageCategories.income")
            }
            onPress={() => setSelectedType("income")}
          />
        </CustomCard>

        {categories.map((category) => {
          const isCustom = state.customCategories.some(
            (item) => item.id === category.id,
          );
          return (
            <CustomCard key={category.id}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: theme.spacing.sm,
                }}
              >
                <View style={{ flex: 1 }}>
                  <CustomText variant="body">
                    {getCategoryName(category.id, category.name)}
                  </CustomText>
                  <CustomText variant="caption" color="textSecondary">
                    {category.type === "expense"
                      ? t("manageCategories.expense")
                      : t("manageCategories.income")}
                    {!isCustom
                      ? ` . ${t("manageCategories.builtIn")}`
                      : ` . ${t("manageCategories.custom")}`}
                  </CustomText>
                </View>
                {isCustom && (
                  <View
                    style={{
                      flexDirection: "row",
                      gap: theme.spacing.sm,
                    }}
                  >
                    <CustomButton
                      label={t("manageCategories.edit")}
                      onPress={() => {
                        setEditingCategoryId(category.id);
                        setCategoryName(category.name);
                        setSelectedType(category.type);
                        setCategoryError("");
                        setIsCreatingCategory(true);
                      }}
                    />

                    <CustomButton
                      label={t("manageCategories.delete")}
                      onPress={() => handleRequestDelete(category.id)}
                    />
                  </View>
                )}
              </View>
            </CustomCard>
          );
        })}

        <Modal
          visible={isCreatingCategory}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setIsCreatingCategory(false)}
        >
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              padding: theme.spacing.lg,
              backgroundColor: theme.colors.background,
            }}
          >
            <CustomCard>
              <CustomText
                style={{ marginBottom: theme.spacing.md }}
                variant="heading"
              >
                {editingCategoryId
                  ? t("manageCategories.editCategory")
                  : t("manageCategories.createCustomCategory")}
              </CustomText>
              <CustomText variant="body">
                {t("manageCategories.categoryTypeDescription", {
                  type:
                    selectedType === "expense"
                      ? t("manageCategories.expense")
                      : t("manageCategories.income"),
                })}
              </CustomText>
              <CustomTextInput
                value={categoryName}
                style={{ marginVertical: theme.spacing.sm }}
                onChangeText={setCategoryName}
                placeholder={t("manageCategories.namePlaceholder")}
                autoFocus
                returnKeyType="done"
                onSubmitEditing={handleSaveCategory}
              />
              {categoryError ? (
                <CustomText variant="caption" color="danger">
                  {categoryError}
                </CustomText>
              ) : null}
              <CustomButton
                label={
                  editingCategoryId
                    ? t("manageCategories.saveChanges")
                    : t("manageCategories.saveCategory")
                }
                onPress={handleSaveCategory}
                style={{ marginVertical: theme.spacing.sm }}
              />
              <CustomButton
                label={t("manageCategories.cancel")}
                onPress={() => {
                  setCategoryName("");
                  setCategoryError("");
                  setIsCreatingCategory(false);
                }}
              />
            </CustomCard>
          </View>
        </Modal>
        <ConfirmationDialog
          visible={isDeleteDialogVisible}
          title={t("manageCategories.deleteCategory")}
          message={t("manageCategories.deleteDescription")}
          confirmLabel={t("manageCategories.delete")}
          cancelLabel={t("manageCategories.cancel")}
          onConfirm={handleDeleteCategory}
          onCancel={() => {
            setDeletingCategoryId(null);
            setIsDeleteDialogVisible(false);
          }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
