import { useRouter } from "expo-router";

import { useAppState } from "@/core/providers/AppStateProvider";
import TransactionForm from "../components/TransactionForm";
import type { Transaction } from "../types/transaction.type";

export const AddTransactionScreen = () => {
  const router = useRouter();
  const { dispatch } = useAppState();

  const handleSubmit = (values: {
    type: Transaction["type"];
    amount: number;
    categoryId: string;
    note?: string;
    date: Date;
  }) => {
    const now = new Date().toISOString();

    const newTransaction: Transaction = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      type: values.type,
      amount: values.amount,
      categoryId: values.categoryId,
      note: values.note,
      date: values.date.toISOString(),
      createdAt: now,
    };

    dispatch({
      type: "ADD_TRANSACTION",
      payload: newTransaction,
    });

    router.back();
  };

  return (
    <TransactionForm
      mode="add"
      submitLabel="Save Transaction"
      onSubmit={handleSubmit}
    />
  );
};
