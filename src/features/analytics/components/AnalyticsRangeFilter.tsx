import FilterBar from "@/shared/components/FilterBar";
import { useTranslation } from "react-i18next";
import { type AnalyticsDateRange } from "../types/analytics-filters.type";

interface AnalyticsDateRangeFilterProps {
  selectedRange: AnalyticsDateRange;
  onRangeChange: (range: AnalyticsDateRange) => void;
}

const DATE_RANGE_OPTIONS = [
  { labelKey: "analytics.sevenDays", value: "7d" },
  { labelKey: "analytics.thirtyDays", value: "30d" },
  { labelKey: "analytics.ninetyDays", value: "90d" },
  { labelKey: "analytics.twelveMonths", value: "12m" },
] as const;

export default function AnalyticsDateRangeFilter({
  selectedRange,
  onRangeChange,
}: AnalyticsDateRangeFilterProps) {
  const { t } = useTranslation();
  return (
    <FilterBar<AnalyticsDateRange>
      options={DATE_RANGE_OPTIONS.map((option) => ({
        label: t(option.labelKey),
        value: option.value,
      }))}
      selectedValue={selectedRange}
      onSelect={onRangeChange}
      scrollable
    />
  );
}
