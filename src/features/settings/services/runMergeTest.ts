import { testMergeBackupService } from "./mergeBackupService.test";

try {
  const result = testMergeBackupService();

  console.log(`✓ ${result}`);
} catch (error) {
  console.error("✗ Backup merge tests failed:", error);
  process.exitCode = 1;
}
