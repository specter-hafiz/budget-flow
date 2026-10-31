import {
  TRANSACTION_CATEGORIES,
  type TransactionCategory,
} from "@/features/transactions/constants/categories";
import { generateMergeId } from "./generateMergeId";

export interface CategoryMergeResult {
  categories: TransactionCategory[];
  categoryIdMap: Map<string, string>;
}

export function mergeCategories(
  existing: TransactionCategory[],
  imported: TransactionCategory[],
): CategoryMergeResult {
  const merged = [...existing];

  const categoriesById = new Map(
    [...TRANSACTION_CATEGORIES, ...existing].map((category) => [
      category.id,
      category,
    ]),
  );

  const categoryIdMap = new Map<string, string>();

  for (const category of imported) {
    const existingCategory = categoriesById.get(category.id);

    // No ID conflict: import normally.
    if (!existingCategory) {
      merged.push(category);
      categoriesById.set(category.id, category);
      categoryIdMap.set(category.id, category.id);
      continue;
    }

    // Same ID and same content: reuse existing category.
    if (
      existingCategory.name === category.name &&
      existingCategory.type === category.type
    ) {
      categoryIdMap.set(category.id, existingCategory.id);
      continue;
    }

    // ID conflict with different content.
    // Check whether an equivalent custom category already exists.
    const matchingCategory = merged.find(
      (item) => item.name === category.name && item.type === category.type,
    );

    if (matchingCategory) {
      categoryIdMap.set(category.id, matchingCategory.id);
      continue;
    }

    // No equivalent category found: generate a unique ID.
    const newId = generateMergeId(category.id, new Set(categoriesById.keys()));

    const newCategory: TransactionCategory = {
      ...category,
      id: newId,
    };

    merged.push(newCategory);
    categoriesById.set(newId, newCategory);
    categoryIdMap.set(category.id, newId);
  }

  return {
    categories: merged,
    categoryIdMap,
  };
}
