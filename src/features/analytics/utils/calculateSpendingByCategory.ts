import {
  getCategoryById,
  TransactionCategory,
} from "@/features/transactions/constants/categories";
import type { Transaction } from "@/features/transactions/types/transaction.type";

export interface CategorySpending {
  categoryId: string;
  categoryName: string;
  total: number;
  percentage: number;
}

export function calculateSpendingByCategory(
  transactions: Transaction[],
  customCategories: TransactionCategory[],
): CategorySpending[] {
  const expensesByCategory = new Map<string, number>();

  for (const transaction of transactions) {
    if (transaction.type !== "expense") {
      continue;
    }

    const currentTotal = expensesByCategory.get(transaction.categoryId) ?? 0;

    expensesByCategory.set(
      transaction.categoryId,
      currentTotal + transaction.amount,
    );
  }

  const totalExpenses = Array.from(expensesByCategory.values()).reduce(
    (sum, amount) => sum + amount,
    0,
  );

  return Array.from(expensesByCategory.entries())
    .map(([categoryId, total]) => {
      const category = getCategoryById(categoryId, customCategories);

      return {
        categoryId,
        categoryName: category?.name ?? "Other",
        total,
        percentage: totalExpenses > 0 ? (total / totalExpenses) * 100 : 0,
      };
    })
    .sort((a, b) => b.total - a.total);
}
