import type { Transaction } from "@/features/transactions/types/transaction.type";
import type { AnalyticsDateRange } from "../types/analytics-filters.type";
import { calculateAnalyticsSummary } from "./calculateAnalyticsSummary";
import { filterAnalyticsTransactions } from "./filterAnalyticsTransactions";

export function getAnalyticsSummary(
  transactions: Transaction[],
  range: AnalyticsDateRange,
  referenceDate: Date = new Date(),
) {
  const filteredTransactions = filterAnalyticsTransactions(
    transactions,
    range,
    referenceDate,
  );

  return calculateAnalyticsSummary(filteredTransactions);
}
