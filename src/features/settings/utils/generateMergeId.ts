/**
 * Generates a deterministic, unique ID for an imported record.
 *
 * The same set of existing IDs and original ID will
 * always produce the same result.
 */
export function generateMergeId(
  originalId: string,
  existingIds: Set<string>,
): string {
  let counter = 1;
  let candidate = `${originalId}_import_${counter}`;

  while (existingIds.has(candidate)) {
    counter += 1;
    candidate = `${originalId}_import_${counter}`;
  }

  return candidate;
}
