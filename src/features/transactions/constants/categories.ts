export type CategoryType = "expense" | "income";

export interface TransactionCategory {
  id: string;
  name: string;
  type: CategoryType;
}

export const TRANSACTION_CATEGORIES: TransactionCategory[] = [
  // Expense categories
  { id: "food_dining", name: "Food & Dining", type: "expense" },
  { id: "transport", name: "Transport", type: "expense" },
  { id: "housing", name: "Housing", type: "expense" },
  { id: "shopping", name: "Shopping", type: "expense" },
  { id: "bills", name: "Bills", type: "expense" },
  { id: "health", name: "Health", type: "expense" },
  { id: "education", name: "Education", type: "expense" },
  { id: "entertainment", name: "Entertainment", type: "expense" },
  { id: "personal_care", name: "Personal Care", type: "expense" },
  { id: "family", name: "Family", type: "expense" },
  { id: "other_expense", name: "Other", type: "expense" },

  // Income categories
  { id: "salary", name: "Salary", type: "income" },
  { id: "business", name: "Business", type: "income" },
  { id: "freelance", name: "Freelance", type: "income" },
  { id: "investment", name: "Investment", type: "income" },
  { id: "gift", name: "Gift", type: "income" },
  { id: "allowance", name: "Allowance", type: "income" },
  { id: "other_income", name: "Other", type: "income" },
];

export function getCategoriesByType(
  type: CategoryType,
  customCategories: TransactionCategory[] = [],
) {
  return [...TRANSACTION_CATEGORIES, ...customCategories].filter(
    (category) => category.type === type,
  );
}

export function getCategoryById(
  id: string,
  customCategories: TransactionCategory[] = [],
) {
  return [...TRANSACTION_CATEGORIES, ...customCategories].find(
    (category) => category.id === id,
  );
}
