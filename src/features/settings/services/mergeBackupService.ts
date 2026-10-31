import type { AppState } from "@/core/providers/AppStateProvider";
import { mergeBudgets } from "@/features/settings/utils/mergeBudgets";
import { mergeCategories } from "@/features/settings/utils/mergeCategories";
import { mergeTransactions } from "@/features/settings/utils/mergeTransactions";

/**
 * Merges a validated backup into the current app state.
 *
 * Existing profile, onboarding status, and settings are preserved.
 */
export function mergeBackupData(current: AppState, backup: AppState): AppState {
  // 1. Merge custom categories first.
  const { categories, categoryIdMap } = mergeCategories(
    current.customCategories,
    backup.customCategories,
  );

  // 2. Remap imported transaction category IDs.
  const importedTransactions = backup.transactions.map((transaction) => ({
    ...transaction,
    categoryId:
      categoryIdMap.get(transaction.categoryId) ?? transaction.categoryId,
  }));

  // 3. Merge transactions.
  const transactions = mergeTransactions(
    current.transactions,
    importedTransactions,
  );

  // 4. Merge budgets using the category ID mapping.
  const budgets = mergeBudgets(current.budgets, backup.budgets, categoryIdMap);

  // 5. Preserve current user preferences and profile.
  return {
    ...current,
    transactions,
    budgets,
    customCategories: categories,
  };
}
