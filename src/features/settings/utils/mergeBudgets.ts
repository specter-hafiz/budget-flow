import type { Budget } from "@/features/budgets/types/budget.type";
import { generateMergeId } from "./generateMergeId";

export function mergeBudgets(
  existing: Budget[],
  imported: Budget[],
  categoryIdMap: Map<string, string>,
): Budget[] {
  const merged = [...existing];

  const budgetIds = new Set(existing.map((budget) => budget.id));

  const budgetKeys = new Set(
    existing.map((budget) => `${budget.categoryId}:${budget.month}`),
  );

  for (const budget of imported) {
    // Resolve category ID conflicts from the category merge.
    const categoryId =
      categoryIdMap.get(budget.categoryId) ?? budget.categoryId;

    const budgetKey = `${categoryId}:${budget.month}`;

    // Preserve an existing budget for this category and month.
    if (budgetKeys.has(budgetKey)) {
      continue;
    }
    const id = budgetIds.has(budget.id)
      ? generateMergeId(budget.id, budgetIds)
      : budget.id;

    const newBudget: Budget = {
      ...budget,
      id,
      categoryId,
    };

    merged.push(newBudget);

    budgetIds.add(id);
    budgetKeys.add(budgetKey);
  }

  return merged;
}
