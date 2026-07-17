/**
 * lib/activity/diff.ts
 *
 * Pure utility for computing structured field-level diffs between two objects.
 * Used by the audit trail system (activity events) to record what changed
 * when entities are mutated.
 *
 * The returned diff is an array of ActivityChange objects, each describing
 * a single field that changed between `previous` and `current`.
 *
 * Sensitive fields (passwords, keys, etc.) are excluded from the diff.
 * Fields that exist in previous but not current are treated as removed.
 * Fields that exist in current but not previous are treated as added.
 */

import type { ActivityChange } from "@guildpass/integration-client";

/**
 * Fields that should never appear in an audit diff.
 * When adding new secrets to entities, append their field names here.
 */
const SENSITIVE_FIELDS = new Set([
  "password",
  "apiKey",
  "privateKey",
  "secret",
  "token",
  "webhookSecret",
]);

/**
 * Compute the difference between two object snapshots.
 *
 * @param previous - The object state before the mutation.
 * @param current  - The object state after the mutation.
 * @returns An array of ActivityChange objects, one per changed field.
 *          Returns an empty array if the objects are deeply equal.
 *
 * @example
 *   const prev = { name: "Old", count: 5 };
 *   const curr = { name: "New", count: 10 };
 *   computeDiff(prev, curr);
 *   // [
 *   //   { field: "name",  before: "Old", after: "New" },
 *   //   { field: "count", before: 5,     after: 10 },
 *   // ]
 */
export function computeDiff(
  previous: Record<string, unknown>,
  current: Record<string, unknown>,
): ActivityChange[] {
  // Collect all unique keys from both objects
  const allKeys = new Set([
    ...Object.keys(previous),
    ...Object.keys(current),
  ]);

  const changes: ActivityChange[] = [];

  for (const key of allKeys) {
    // Never expose sensitive fields in audit diffs
    if (SENSITIVE_FIELDS.has(key)) continue;

    const before = previous[key];
    const after = current[key];

    // Skip unchanged fields (shallow equality is sufficient for primitive counters)
    if (before === after) continue;

    // Both undefined after sensitive-field skip? Skip.
    if (before === undefined && after === undefined) continue;

    changes.push({ field: key, before, after });
  }

  return changes;
}
