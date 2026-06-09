/**
 * Format date to readable string
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Format date to full readable string with time
 */
export function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Get relative time (e.g., "2 days ago", "in 3 weeks")
 */
export function getRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays === -1) return "Yesterday";
  if (diffDays > 0) return `in ${diffDays} days`;
  if (diffDays < 0) return `${Math.abs(diffDays)} days ago`;

  return formatDate(dateString);
}

/**
 * Get days until due date
 */
export function getDaysUntilDue(dateString: string): number {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Check if date is overdue
 */
export function isOverdue(dateString: string): boolean {
  const date = new Date(dateString);
  const now = new Date();
  return date < now;
}

/**
 * Check if date is due soon (within days)
 */
export function isDueSoon(dateString: string, days: number = 7): boolean {
  const daysUntil = getDaysUntilDue(dateString);
  return daysUntil >= 0 && daysUntil <= days;
}

/**
 * Format ISO string to YYYY-MM-DD for input elements
 */
export function formatDateForInput(dateString: string): string {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Convert YYYY-MM-DD to ISO string
 */
export function dateInputToISO(dateString: string): string {
  const date = new Date(dateString);
  return date.toISOString();
}

/**
 * Get week of year
 */
export function getWeekNumber(dateString: string): number {
  const date = new Date(dateString);
  const firstDay = new Date(date.getFullYear(), 0, 1);
  const dayOfWeek = date.getDay() - firstDay.getDay() + 1;
  return Math.ceil(dayOfWeek / 7);
}
