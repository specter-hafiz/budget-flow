import type { Budget } from "@/features/budgets/types/budget.type";

import type { Transaction } from "@/features/transactions/types/transaction.type";
import {
  BudgetProgress,
  calculateBudgetProgress,
} from "./calculateBudgetProgress";

export function getMonthlyBudgetsProgress(
  budgets: Budget[],
  transactions: Transaction[],
  month: string,
): BudgetProgress[] {
  return budgets
    .filter((budget) => budget.month === month)
    .map((budget) => calculateBudgetProgress(budget, transactions))
    .sort((a, b) => b.percentageUsed - a.percentageUsed);
}
