/**
 * Pure date and time utilities for Africa/Lagos timezone (UTC+1, no DST)
 */

export const LAGOS_OFFSET_HOURS = 1; // Africa/Lagos is always UTC+1

/**
 * Returns the current ISO date string for Africa/Lagos (e.g. "2026-10-18")
 */
export function getLagosDateId(date: Date = new Date()): string {
  // Add 1 hour to UTC to get Lagos local time
  const utcMillis = date.getTime() + date.getTimezoneOffset() * 60000;
  const lagosTime = new Date(utcMillis + LAGOS_OFFSET_HOURS * 3600000);
  const year = lagosTime.getFullYear();
  const month = String(lagosTime.getMonth() + 1).padStart(2, '0');
  const day = String(lagosTime.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Checks if dateB is the immediate calendar day after dateA in Lagos
 */
export function isConsecutiveLagosDay(prevDateId: string, currentDateId: string): boolean {
  if (!prevDateId || !currentDateId) return false;
  const [y1, m1, d1] = prevDateId.split('-').map(Number);
  const [y2, m2, d2] = currentDateId.split('-').map(Number);
  
  const dA = new Date(Date.UTC(y1, m1 - 1, d1));
  const dB = new Date(Date.UTC(y2, m2 - 1, d2));
  
  const diffDays = Math.round((dB.getTime() - dA.getTime()) / (1000 * 60 * 60 * 24));
  return diffDays === 1;
}

/**
 * Calculates updated streak given the last completed challenge date and today's date
 */
export function calculateUpdatedStreak(
  currentStreak: number,
  lastCompletedDateId: string | undefined,
  todayDateId: string
): number {
  if (!lastCompletedDateId) {
    return 1;
  }
  if (lastCompletedDateId === todayDateId) {
    // Already played today, streak remains unchanged
    return currentStreak > 0 ? currentStreak : 1;
  }
  if (isConsecutiveLagosDay(lastCompletedDateId, todayDateId)) {
    return (currentStreak || 0) + 1;
  }
  // Missed one or more days, start fresh at 1
  return 1;
}

/**
 * Milliseconds until midnight in Africa/Lagos
 */
export function getMsUntilLagosMidnight(now: Date = new Date()): number {
  const utcMillis = now.getTime() + now.getTimezoneOffset() * 60000;
  const lagosTime = new Date(utcMillis + LAGOS_OFFSET_HOURS * 3600000);
  
  const nextMidnight = new Date(lagosTime);
  nextMidnight.setHours(24, 0, 0, 0);
  
  return Math.max(0, nextMidnight.getTime() - lagosTime.getTime());
}
