/**
 * Date and time helper utilities for Gyanmitra
 */

/**
 * Returns true if the given date is within the last 45 minutes
 */
export const isJustNow = (date: Date | string | number | null | undefined): boolean => {
  if (!date) return false;
  const timestamp = new Date(date).getTime();
  if (isNaN(timestamp)) return false;
  const diffMs = Date.now() - timestamp;
  return diffMs >= 0 && diffMs <= 45 * 60 * 1000;
};
