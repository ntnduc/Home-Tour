/**
 * Utility functions for date manipulation
 */

/**
 * Format date to ISO string
 * @param date - Date to format
 * @returns ISO string
 */
export function toISOString(date: Date): string {
  return date.toISOString();
}

/**
 * Get current timestamp
 * @returns Current timestamp in milliseconds
 */
export function getCurrentTimestamp(): number {
  return Date.now();
}

export function getCurrentDate(isClient?: boolean): Date {
  return new Date();
}

/**
 * Add days to a date
 * @param date - Base date
 * @param days - Number of days to add
 * @returns New date
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Check if date is today
 * @param date - Date to check
 * @returns True if date is today
 */
export function isToday(date: Date): boolean {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

/**
 * Format date to Vietnamese format (dd/mm/yyyy)
 * @param date - Date to format
 * @returns Formatted date string
 */
export function formatVietnameseDate(date: Date): string {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Get string date
 * @param date - Date to convert
 * @returns String representation of date
 */
export function convertDateToString(date: Date): string {
  return date.toString();
}

/**
 * Get the end of the month for a given date
 * @param date - Date to check
 * @returns End of the month date
 */
export function getEndOfMonth(date: Date): Date {
  const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return endOfMonth;
}

/**
 * Get the number of days between two dates
 * @param a - Start date
 * @param b - End date
 * @returns Number of days between a and b
 */
export function diffDays(a: Date, b: Date): number {
  const MS_PER_DAY = 1000 * 60 * 60 * 24;
  return Math.floor((b.getTime() - a.getTime()) / MS_PER_DAY) + 1;
}

/**
 * Get the number of days in a month for a given date
 * @param date - Date to check
 * @returns Number of days in the month
 */
export function getDaysInMonth(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

/** * Get date without time
 * @param date - Date to convert
 * @returns Date without time
 */
export function getDateWithoutTime(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}
