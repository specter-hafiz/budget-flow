import type { Transaction } from "@/features/transactions/types/transaction.type";
import { generateMergeId } from "./generateMergeId";

function hasSameContent(first: Transaction, second: Transaction): boolean {
  return (
    first.type === second.type &&
    first.amount === second.amount &&
    first.categoryId === second.categoryId &&
    first.note === second.note &&
    first.date === second.date &&
    first.createdAt === second.createdAt
  );
}

export function mergeTransactions(
  existing: Transaction[],
  imported: Transaction[],
): Transaction[] {
  const merged = [...existing];

  const transactionsById = new Map(
    existing.map((transaction) => [transaction.id, transaction]),
  );

  for (const transaction of imported) {
    const existingTransaction = transactionsById.get(transaction.id);

    // No ID conflict: import normally.
    if (!existingTransaction) {
      merged.push(transaction);
      transactionsById.set(transaction.id, transaction);
      continue;
    }

    // Same ID and same content: skip duplicate.
    if (hasSameContent(existingTransaction, transaction)) {
      continue;
    }

    // An ID conflict exists. Check whether this exact transaction
    // was already imported under a different ID.
    const alreadyImported = merged.some((item) =>
      hasSameContent(item, transaction),
    );

    if (alreadyImported) {
      continue;
    }

    // Same ID but different content: generate a unique ID.
    const newId = generateMergeId(
      transaction.id,
      new Set(transactionsById.keys()),
    );
    const newTransaction: Transaction = {
      ...transaction,
      id: newId,
    };

    merged.push(newTransaction);
    transactionsById.set(newId, newTransaction);
  }

  return merged;
}
