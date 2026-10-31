import type { Budget } from "@/features/budgets/types/budget.type";
import type { Transaction } from "@/features/transactions/types/transaction.type";

export interface BudgetProgress {
  budget: Budget;
  spent: number;
  remaining: number;
  percentageUsed: number;
}

export function calculateBudgetProgress(
  budget: Budget,
  transactions: Transaction[],
): BudgetProgress {
  const spent = transactions.reduce((total, transaction) => {
    if (transaction.type !== "expense") {
      return total;
    }

    if (transaction.categoryId !== budget.categoryId) {
      return total;
    }

    const transactionDate = new Date(transaction.date);

    if (Number.isNaN(transactionDate.getTime())) {
      return total;
    }

    const transactionMonth = [
      transactionDate.getFullYear(),
      String(transactionDate.getMonth() + 1).padStart(2, "0"),
    ].join("-");

    if (transactionMonth !== budget.month) {
      return total;
    }

    return total + transaction.amount;
  }, 0);

  return {
    budget,
    spent,
    remaining: budget.amount - spent,
    percentageUsed: budget.amount > 0 ? (spent / budget.amount) * 100 : 0,
  };
}
