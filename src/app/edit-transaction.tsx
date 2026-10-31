import { useTheme } from "@shopify/restyle";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAppState } from "@/core/providers/AppStateProvider";
import type { AppTheme } from "@/core/theme/restyle";
import TransactionForm from "@/features/transactions/components/TransactionForm";
import type { Transaction } from "@/features/transactions/types/transaction.type";
import CustomText from "@/shared/components/CustomText";

export default function EditTransactionScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { state, dispatch } = useAppState();
  const theme = useTheme<AppTheme>();

  const transaction = state.transactions.find((item) => item.id === id);

  if (!transaction) {
    return (
      <SafeAreaView
        edges={["top"]}
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <View style={styles.content}>
          <CustomText variant="heading">Transaction not found</CustomText>
          <CustomText variant="body" marginTop="sm">
            This transaction may have been deleted.
          </CustomText>
        </View>
      </SafeAreaView>
    );
  }

  const handleUpdate = (values: {
    type: Transaction["type"];
    amount: number;
    categoryId: string;
    note?: string;
    date: Date;
  }) => {
    const updatedTransaction: Transaction = {
      ...transaction,
      type: values.type,
      amount: values.amount,
      categoryId: values.categoryId,
      note: values.note,
      date: values.date.toISOString(),
    };

    dispatch({
      type: "UPDATE_TRANSACTION",
      payload: updatedTransaction,
    });

    router.back();
  };

  return (
    <TransactionForm
      mode="edit"
      key={transaction.id}
      initialType={transaction.type}
      initialAmount={String(transaction.amount)}
      initialCategoryId={transaction.categoryId}
      initialNote={transaction.note ?? ""}
      initialDate={new Date(transaction.date)}
      submitLabel="Update Transaction"
      onSubmit={handleUpdate}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
});
