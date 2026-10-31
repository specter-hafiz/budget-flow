import type { BudgetFlowBackup } from "@/features/settings/types/backup.type";
import {
  TRANSACTION_CATEGORIES,
  TransactionCategory,
} from "@/features/transactions/constants/categories";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isValidProfile(value: unknown): boolean {
  if (value === null) return true;

  return (
    isRecord(value) &&
    typeof value.name === "string" &&
    value.name.trim().length > 0 &&
    (value.photoUri === null || typeof value.photoUri === "string")
  );
}

function hasValidOnboardingState(
  profile: unknown,
  onboardingComplete: unknown,
): boolean {
  if (typeof onboardingComplete !== "boolean") {
    return false;
  }

  if (onboardingComplete && profile === null) {
    return false;
  }

  return true;
}

function isValidSettings(value: unknown): boolean {
  return (
    isRecord(value) &&
    typeof value.language === "string" &&
    typeof value.currency === "string"
  );
}

function isValidTransaction(value: unknown): boolean {
  if (!isRecord(value)) return false;

  return (
    typeof value.id === "string" &&
    (value.type === "income" || value.type === "expense") &&
    typeof value.amount === "number" &&
    Number.isFinite(value.amount) &&
    value.amount > 0 &&
    typeof value.categoryId === "string" &&
    (value.note === undefined || typeof value.note === "string") &&
    typeof value.date === "string" &&
    !Number.isNaN(Date.parse(value.date)) &&
    typeof value.createdAt === "string" &&
    !Number.isNaN(Date.parse(value.createdAt))
  );
}

function isValidBudget(value: unknown): boolean {
  if (!isRecord(value)) return false;

  return (
    typeof value.id === "string" &&
    typeof value.categoryId === "string" &&
    typeof value.amount === "number" &&
    Number.isFinite(value.amount) &&
    value.amount > 0 &&
    typeof value.month === "string" &&
    /^\d{4}-(0[1-9]|1[0-2])$/.test(value.month) &&
    typeof value.createdAt === "string" &&
    !Number.isNaN(Date.parse(value.createdAt))
  );
}

function hasValidRelationships(
  transactions: unknown[],
  budgets: unknown[],
  customCategories: unknown[],
): boolean {
  const categories = [
    ...TRANSACTION_CATEGORIES,
    ...(customCategories as TransactionCategory[]),
  ];

  const categoryMap = new Map(
    categories.map((category) => [category.id, category]),
  );

  // Prevent duplicate or conflicting category IDs.
  if (categoryMap.size !== categories.length) {
    return false;
  }

  // Every transaction must reference a category of the same type.
  const validTransactions = transactions.every((item) => {
    const transaction = item as {
      id: string;
      type: "income" | "expense";
      categoryId: string;
    };

    const category = categoryMap.get(transaction.categoryId);

    return category !== undefined && category.type === transaction.type;
  });

  if (!validTransactions) return false;

  // Budgets must reference expense categories.
  const validBudgets = budgets.every((item) => {
    const budget = item as {
      categoryId: string;
    };

    const category = categoryMap.get(budget.categoryId);

    return category !== undefined && category.type === "expense";
  });

  if (!validBudgets) return false;

  // Transaction IDs and budget IDs must each be unique.
  const transactionIds = transactions.map(
    (item) => (item as { id: string }).id,
  );

  const budgetIds = budgets.map((item) => (item as { id: string }).id);

  return (
    new Set(transactionIds).size === transactionIds.length &&
    new Set(budgetIds).size === budgetIds.length
  );
}

function isValidCategory(value: unknown): boolean {
  if (!isRecord(value)) return false;

  return (
    typeof value.id === "string" &&
    value.id.trim().length > 0 &&
    typeof value.name === "string" &&
    value.name.trim().length > 0 &&
    (value.type === "income" || value.type === "expense")
  );
}

export function isValidBudgetFlowBackup(
  value: unknown,
): value is BudgetFlowBackup {
  if (!isRecord(value)) return false;

  if (value.app !== "BudgetFlow" || value.version !== 1) {
    return false;
  }

  if (
    typeof value.createdAt !== "string" ||
    !Number.isFinite(Date.parse(value.createdAt))
  ) {
    return false;
  }

  const data = value.data;

  if (!isRecord(data)) return false;

  return (
    isValidProfile(data.profile) &&
    hasValidOnboardingState(data.profile, data.onboardingComplete) &&
    Array.isArray(data.transactions) &&
    data.transactions.every(isValidTransaction) &&
    Array.isArray(data.budgets) &&
    data.budgets.every(isValidBudget) &&
    isValidSettings(data.settings) &&
    Array.isArray(data.customCategories) &&
    data.customCategories.every(isValidCategory) &&
    hasValidRelationships(
      data.transactions,
      data.budgets,
      data.customCategories,
    )
  );
}
