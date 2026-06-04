/**
 * safeJsonParse — Parse & validate JSON with a zod schema.
 * Returns the parsed value, or `fallback` if parsing/validation fails.
 *
 * @param raw      Raw JSON string
 * @param schema   Zod schema to validate against
 * @param fallback Value to return on failure
 *
 * @example
 *   const entries = safeJsonParse(stored, z.array(PasswordEntrySchema), []);
 */
import type { z } from 'zod';

export function safeJsonParse<T>(
  raw: string,
  schema: z.ZodSchema<T>,
  fallback: T
): T {
  try {
    const parsed = JSON.parse(raw);
    const result = schema.safeParse(parsed);
    if (result.success) return result.data;
    console.warn('safeJsonParse: validation failed', result.error.format());
    return fallback;
  } catch {
    return fallback;
  }
}
