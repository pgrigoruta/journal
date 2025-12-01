/**
 * Date utility functions for handling date-only values (no time component)
 */

/**
 * Convert a Date object to a date-only string (YYYY-MM-DD) in local timezone
 */
export function toDateOnlyString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Create a Date object from a date-only string (YYYY-MM-DD) in local timezone
 * Returns a Date set to midnight in local timezone
 */
export function fromDateOnlyString(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  // Create date in local timezone (month is 0-indexed in Date constructor)
  return new Date(year, month - 1, day, 0, 0, 0, 0);
}

/**
 * Normalize a Date to date-only (set to midnight in local timezone)
 */
export function normalizeToDateOnly(date: Date): Date {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
}

