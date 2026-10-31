import type { AppState } from "@/core/providers/AppStateProvider";
import { storage } from "@/core/storage/mmkv";

const STORAGE_KEY = "budgetflow-app-state";

export function persistAppState(state: AppState): void {
  const serializedState = JSON.stringify(state);

  storage.set(STORAGE_KEY, serializedState);

  const savedState = storage.getString(STORAGE_KEY);

  if (savedState !== serializedState) {
    throw new Error("Failed to verify application state persistence.");
  }
}
