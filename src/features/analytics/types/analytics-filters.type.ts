export const ANALYTICS_DATE_RANGES = [
  { label: "7 Days", value: "7d" },
  { label: "30 Days", value: "30d" },
  { label: "90 Days", value: "90d" },
  { label: "12 Months", value: "12m" },
] as const;

export type AnalyticsDateRange =
  (typeof ANALYTICS_DATE_RANGES)[number]["value"];

export interface AnalyticsFilters {
  dateRange: AnalyticsDateRange;
}

export const DEFAULT_ANALYTICS_FILTERS: AnalyticsFilters = {
  dateRange: "30d",
};
