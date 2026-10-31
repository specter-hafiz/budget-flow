import type { Transaction } from "@/features/transactions/types/transaction.type";
import type { AnalyticsDateRange } from "../types/analytics-filters.type";
import { getAnalyticsDateRange } from "./getAnalyticsDateRange";

export function filterAnalyticsTransactions(
  transactions: Transaction[],
  range: AnalyticsDateRange,
  referenceDate: Date = new Date(),
): Transaction[] {
  const { startDate, endDate } = getAnalyticsDateRange(range, referenceDate);

  return transactions.filter((transaction) => {
    const transactionDate = new Date(transaction.date);

    if (Number.isNaN(transactionDate.getTime())) {
      return false;
    }

    return transactionDate >= startDate && transactionDate <= endDate;
  });
}
