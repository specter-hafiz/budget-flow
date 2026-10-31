import { useCallback } from "react";

import { useAppState } from "@/core/providers/AppStateProvider";
import { formatCurrency } from "@/shared/utils/formatCurrency";
import { formatDate as formatDateUtil } from "@/shared/utils/formatDate";

export function useCurrency() {
  const { state } = useAppState();

  const currency = state.settings.currency || "GHS";
  const language = state.settings.language || "en";

  const format = useCallback(
    (amount: number) => formatCurrency(amount, currency),
    [currency],
  );

  const formatDate = useCallback(
    (date: string | Date) => formatDateUtil(date, language),
    [language],
  );

  return {
    currency,
    language,
    formatCurrency: format,
    formatDate,
  };
}
