import { getCategoryById } from "../constants/categories";
import {
  ALL_CATEGORIES_FILTER,
  DEFAULT_TRANSACTION_FILTERS,
  type TransactionFilters,
} from "../types/transaction-filters.type";
import type { Transaction } from "../types/transaction.type";

export function filterTransactions(
  transactions: Transaction[],
  filters: TransactionFilters = DEFAULT_TRANSACTION_FILTERS,
): Transaction[] {
  const { searchQuery, selectedType, selectedCategory } = filters;
  const query = searchQuery.trim().toLowerCase();

  return transactions.filter((transaction) => {
    const categoryName =
      getCategoryById(transaction.categoryId)?.name ?? transaction.categoryId;

    const note = transaction.note ?? "";

    const matchesSearch =
      !query ||
      categoryName.toLowerCase().includes(query) ||
      note.toLowerCase().includes(query);

    const matchesType =
      selectedType === "all" || transaction.type === selectedType;

    const matchesCategory =
      selectedCategory === ALL_CATEGORIES_FILTER ||
      transaction.categoryId === selectedCategory;

    return matchesSearch && matchesType && matchesCategory;
  });
}
