import type { AppState } from "@/core/providers/AppStateProvider";

export interface BudgetFlowBackup {
  app: "BudgetFlow";
  version: 1;
  createdAt: string;
  data: AppState;
}
