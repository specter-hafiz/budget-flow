import type { BudgetProgress } from "@/features/budgets/utils/calculateBudgetProgress";

export interface MonthlyBudgetSummary {
  totalBudget: number;
  totalSpent: number;
  availableBudget: number;
}

export function calculateMonthlyBudgetSummary(
  budgets: BudgetProgress[],
): MonthlyBudgetSummary {
  const totalBudget = budgets.reduce(
    (total, item) => total + item.budget.amount,
    0,
  );

  const totalSpent = budgets.reduce((total, item) => total + item.spent, 0);

  return {
    totalBudget,
    totalSpent,
    availableBudget: totalBudget - totalSpent,
  };
}
