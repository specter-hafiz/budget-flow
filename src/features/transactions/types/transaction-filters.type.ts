export const TRANSACTION_TYPE_FILTERS = [
  { label: "All", value: "all" },
  { label: "Expenses", value: "expense" },
  { label: "Income", value: "income" },
] as const;

export type TransactionTypeFilter =
  (typeof TRANSACTION_TYPE_FILTERS)[number]["value"];

export const ALL_CATEGORIES_FILTER = "all";

export interface TransactionFilters {
  searchQuery: string;
  selectedType: TransactionTypeFilter;
  selectedCategory: string;
}

export const DEFAULT_TRANSACTION_FILTERS: TransactionFilters = {
  searchQuery: "",
  selectedType: "all",
  selectedCategory: ALL_CATEGORIES_FILTER,
};
