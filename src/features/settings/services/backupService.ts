import type { AppState } from "@/core/providers/AppStateProvider";
import type { BudgetFlowBackup } from "@/features/settings/types/backup.type";
import * as DocumentPicker from "expo-document-picker";
import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";
import { isValidBudgetFlowBackup } from "../utils/backupValidation";
/**
 * Creates a versioned BudgetFlow backup.
 */
export function createBackup(state: AppState): BudgetFlowBackup {
  return {
    app: "BudgetFlow",
    version: 1,
    createdAt: new Date().toISOString(),
    data: state,
  };
}

/**
 * Converts a BudgetFlow backup into formatted JSON.
 */
export function serializeBackup(backup: BudgetFlowBackup): string {
  return JSON.stringify(backup, null, 2);
}

/**
 * Generates a filename for the backup.
 *
 * Example: BudgetFlow-Backup-2026-10-31.json
 */
export function generateBackupFilename(): string {
  const date = new Date().toISOString().split("T")[0];

  return `BudgetFlow-Backup-${date}.json`;
}

/**
 * Selects, parses, and validates a BudgetFlow backup.
 *
 * Returns null if the user cancels the file picker.
 * Throws an error if the selected file is invalid.
 *
 * This function does not modify application state.
 */
export async function importBackup(): Promise<BudgetFlowBackup | null> {
  const fileContents = await selectBackupFile();

  if (fileContents === null) {
    return null;
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(fileContents);
  } catch {
    throw new Error("The selected file is not valid JSON.");
  }

  if (!isValidBudgetFlowBackup(parsed)) {
    throw new Error("This file is not a valid or supported BudgetFlow backup.");
  }

  return parsed;
}

/**
 * Opens the native file picker and reads a selected
 * BudgetFlow JSON backup.
 *
 * Returns null if the user cancels.
 */
export async function selectBackupFile(): Promise<string | null> {
  const result = await DocumentPicker.getDocumentAsync({
    type: ["application/json", "text/plain"],
    copyToCacheDirectory: true,
    multiple: false,
  });

  if (result.canceled) {
    return null;
  }

  const selectedFile = result.assets[0];

  if (!selectedFile) {
    throw new Error("No backup file was selected.");
  }

  if (!selectedFile.name.toLowerCase().endsWith(".json")) {
    throw new Error("Please select a JSON backup file.");
  }

  const file = new File(selectedFile.uri);

  return await file.text();
}

/**
 * Creates a JSON backup file and opens the native share sheet.
 */
export async function exportBackup(state: AppState): Promise<void> {
  const backup = createBackup(state);
  const json = serializeBackup(backup);
  const filename = generateBackupFilename();

  const file = new File(Paths.cache, filename);

  try {
    file.create({ overwrite: true });
    file.write(json);

    const canShare = await Sharing.isAvailableAsync();

    if (!canShare) {
      throw new Error("File sharing is not available on this device.");
    }

    await Sharing.shareAsync(file.uri, {
      mimeType: "application/json",
      dialogTitle: "Export BudgetFlow Backup",
      UTI: "public.json",
    });
  } finally {
    // The file is temporary, but do not delete it immediately:
    // the destination may still need access after the share sheet closes.
  }
}
