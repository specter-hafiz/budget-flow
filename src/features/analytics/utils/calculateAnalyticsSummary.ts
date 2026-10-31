import type { Transaction } from "@/features/transactions/types/transaction.type";

export interface AnalyticsSummary {
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  transactionCount: number;
}

export function calculateAnalyticsSummary(
  transactions: Transaction[],
): AnalyticsSummary {
  const summary = transactions.reduce(
    (totals, transaction) => {
      if (transaction.type === "income") {
        totals.totalIncome += transaction.amount;
      } else {
        totals.totalExpenses += transaction.amount;
      }

      return totals;
    },
    {
      totalIncome: 0,
      totalExpenses: 0,
    },
  );

  return {
    ...summary,
    netBalance: summary.totalIncome - summary.totalExpenses,
    transactionCount: transactions.length,
  };
}
