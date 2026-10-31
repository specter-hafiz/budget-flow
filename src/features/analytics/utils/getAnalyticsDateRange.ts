import type { AnalyticsDateRange } from "../types/analytics-filters.type";

export interface AnalyticsDateRangeResult {
  startDate: Date;
  endDate: Date;
}

export function getAnalyticsDateRange(
  range: AnalyticsDateRange,
  referenceDate: Date = new Date(),
): AnalyticsDateRangeResult {
  const endDate = new Date(referenceDate);
  const startDate = new Date(referenceDate);

  switch (range) {
    case "7d":
      startDate.setDate(startDate.getDate() - 6);
      break;

    case "30d":
      startDate.setDate(startDate.getDate() - 29);
      break;

    case "90d":
      startDate.setDate(startDate.getDate() - 89);
      break;

    case "12m":
      startDate.setFullYear(startDate.getFullYear() - 1);
      startDate.setDate(startDate.getDate() + 1);
      break;
  }

  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(23, 59, 59, 999);

  return { startDate, endDate };
}
