import type { AppState } from "@/core/providers/AppStateProvider";
import { mergeBackupData } from "./mergeBackupService";

function makeState(overrides: Partial<AppState> = {}): AppState {
  return {
    profile: null,
    onboardingComplete: false,
    transactions: [],
    budgets: [],
    settings: {
      language: "en",
      currency: "GHS",
    },
    customCategories: [],
    ...overrides,
  };
}

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Test failed: ${message}`);
  }
}

export function testMergeBackupService() {
  const existing = makeState({
    transactions: [
      {
        id: "txn_001",
        type: "expense",
        amount: 100,
        categoryId: "food_dining",
        date: "2026-10-01",
        createdAt: "2026-10-01T10:00:00.000Z",
      },
    ],
    budgets: [
      {
        id: "budget_001",
        categoryId: "food_dining",
        amount: 500,
        month: "2026-10",
        createdAt: "2026-10-01T10:00:00.000Z",
      },
    ],
  });

  const backup = makeState({
    transactions: [
      {
        id: "txn_001",
        type: "expense",
        amount: 200,
        categoryId: "food_dining",
        date: "2026-10-02",
        createdAt: "2026-10-02T10:00:00.000Z",
      },
    ],
    budgets: [
      {
        id: "budget_002",
        categoryId: "food_dining",
        amount: 800,
        month: "2026-10",
        createdAt: "2026-10-02T10:00:00.000Z",
      },
    ],
  });

  const merged = mergeBackupData(existing, backup);

  assert(
    merged.transactions.length === 2,
    "Conflicting transactions should both be preserved",
  );

  assert(
    merged.transactions[0].id !== merged.transactions[1].id,
    "Transaction IDs must remain unique",
  );

  assert(
    merged.budgets.length === 1 && merged.budgets[0].amount === 500,
    "Existing monthly budgets must take priority",
  );

  const mergedAgain = mergeBackupData(merged, backup);

  assert(
    mergedAgain.transactions.length === 2,
    "Repeated imports should not duplicate transactions",
  );

  assert(
    mergedAgain.budgets.length === 1,
    "Repeated imports should not duplicate budgets",
  );

  assert(
    JSON.stringify(mergedAgain) === JSON.stringify(merged),
    "Merging the same backup twice should not change the result",
  );

  // Test custom category ID conflicts and transaction remapping.
  const existingWithCategory = makeState({
    customCategories: [
      {
        id: "custom_001",
        name: "Freelance",
        type: "income",
      },
    ],
  });

  const backupWithCategory = makeState({
    customCategories: [
      {
        id: "custom_001",
        name: "Online Business",
        type: "income",
      },
    ],
    transactions: [
      {
        id: "txn_business_001",
        type: "income",
        amount: 1500,
        categoryId: "custom_001",
        date: "2026-10-15",
        createdAt: "2026-10-15T10:00:00.000Z",
      },
    ],
  });

  const mergedCategories = mergeBackupData(
    existingWithCategory,
    backupWithCategory,
  );

  assert(
    mergedCategories.customCategories.length === 2,
    "Both conflicting custom categories should be preserved",
  );

  const importedCategory = mergedCategories.customCategories.find(
    (category) => category.name === "Online Business",
  );

  assert(
    importedCategory !== undefined && importedCategory.id !== "custom_001",
    "Imported conflicting category should receive a new ID",
  );

  assert(
    mergedCategories.transactions[0].categoryId === importedCategory?.id,
    "Imported transaction must reference the remapped category",
  );

  // Import the same backup again.
  const mergedCategoriesAgain = mergeBackupData(
    mergedCategories,
    backupWithCategory,
  );

  assert(
    mergedCategoriesAgain.customCategories.length === 2,
    "Repeated import should not duplicate custom categories",
  );

  assert(
    mergedCategoriesAgain.transactions.length === 1,
    "Repeated import should not duplicate transactions",
  );

  assert(
    JSON.stringify(mergedCategoriesAgain) === JSON.stringify(mergedCategories),
    "Repeated category import should produce the same state",
  );

  // Test importing a completely new custom category.
  const existingWithoutCategory = makeState();

  const backupWithNewCategory = makeState({
    customCategories: [
      {
        id: "custom_crypto",
        name: "Cryptocurrency",
        type: "expense",
      },
    ],
    transactions: [
      {
        id: "txn_crypto_001",
        type: "expense",
        amount: 300,
        categoryId: "custom_crypto",
        date: "2026-10-20",
        createdAt: "2026-10-20T10:00:00.000Z",
      },
      {
        id: "txn_food_001",
        type: "expense",
        amount: 50,
        categoryId: "food_dining",
        date: "2026-10-21",
        createdAt: "2026-10-21T10:00:00.000Z",
      },
    ],
  });

  const mergedNewCategory = mergeBackupData(
    existingWithoutCategory,
    backupWithNewCategory,
  );

  assert(
    mergedNewCategory.customCategories.length === 1,
    "Missing custom category should be imported",
  );

  assert(
    mergedNewCategory.customCategories[0].name === "Cryptocurrency",
    "Imported category should preserve its name",
  );

  assert(
    mergedNewCategory.transactions.find(
      (transaction) => transaction.id === "txn_crypto_001",
    )?.categoryId === "custom_crypto",
    "Transaction should reference the imported custom category",
  );

  assert(
    mergedNewCategory.transactions.find(
      (transaction) => transaction.id === "txn_food_001",
    )?.categoryId === "food_dining",
    "Built-in category reference should remain unchanged",
  );

  assert(
    !mergedNewCategory.customCategories.some(
      (category) => category.id === "food_dining",
    ),
    "Built-in categories must not be added as custom categories",
  );

  // Test importing the same backup twice.
  const mergedNewCategoryAgain = mergeBackupData(
    mergedNewCategory,
    backupWithNewCategory,
  );

  assert(
    mergedNewCategoryAgain.customCategories.length === 1,
    "Repeated import must not duplicate the custom category",
  );

  assert(
    mergedNewCategoryAgain.transactions.length === 2,
    "Repeated import must not duplicate transactions",
  );

  return "All merge tests passed";
}
