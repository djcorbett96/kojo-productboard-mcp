/**
 * Date filtering utilities for ProductBoard API
 * Converts user-friendly date expressions to API format (YYYY-MM-DD)
 */

/**
 * Parse a date expression and return a date string in YYYY-MM-DD format
 * Supports:
 * - Relative dates: "past month", "past week", "past 7 days", "past 30 days", etc.
 * - ISO date strings: "2024-01-15"
 * - Date objects (will be converted to YYYY-MM-DD)
 */
export function parseDateFilter(dateExpression: string | Date): string {
  // If it's already a Date object, convert it
  if (dateExpression instanceof Date) {
    return formatDateForAPI(dateExpression);
  }

  const expression = dateExpression.toLowerCase().trim();

  // Handle relative dates
  if (expression.startsWith("past ")) {
    return parseRelativeDate(expression);
  }

  // Try to parse as ISO date string
  const date = new Date(dateExpression);
  if (!isNaN(date.getTime())) {
    return formatDateForAPI(date);
  }

  // If we can't parse it, throw an error
  throw new Error(
    `Invalid date expression: "${dateExpression}". Use formats like "past month", "past week", "past 7 days", or ISO date strings like "2024-01-15"`
  );
}

/**
 * Parse relative date expressions like "past month", "past week", "past 7 days"
 */
function parseRelativeDate(expression: string): string {
  const now = new Date();
  let targetDate = new Date(now);

  // Remove "past " prefix
  const rest = expression.substring(5).trim();

  // Handle common relative expressions
  if (rest === "month" || rest === "1 month") {
    targetDate.setMonth(now.getMonth() - 1);
  } else if (rest === "week" || rest === "1 week") {
    targetDate.setDate(now.getDate() - 7);
  } else if (rest === "day" || rest === "1 day") {
    targetDate.setDate(now.getDate() - 1);
  } else if (rest === "year" || rest === "1 year") {
    targetDate.setFullYear(now.getFullYear() - 1);
  } else if (rest.endsWith(" days")) {
    // Parse "past X days"
    const daysMatch = rest.match(/^(\d+)\s*days?$/);
    if (daysMatch) {
      const days = parseInt(daysMatch[1], 10);
      targetDate.setDate(now.getDate() - days);
    } else {
      throw new Error(`Invalid date expression: "past ${rest}"`);
    }
  } else if (rest.endsWith(" weeks")) {
    // Parse "past X weeks"
    const weeksMatch = rest.match(/^(\d+)\s*weeks?$/);
    if (weeksMatch) {
      const weeks = parseInt(weeksMatch[1], 10);
      targetDate.setDate(now.getDate() - weeks * 7);
    } else {
      throw new Error(`Invalid date expression: "past ${rest}"`);
    }
  } else if (rest.endsWith(" months")) {
    // Parse "past X months"
    const monthsMatch = rest.match(/^(\d+)\s*months?$/);
    if (monthsMatch) {
      const months = parseInt(monthsMatch[1], 10);
      targetDate.setMonth(now.getMonth() - months);
    } else {
      throw new Error(`Invalid date expression: "past ${rest}"`);
    }
  } else {
    throw new Error(`Invalid date expression: "past ${rest}"`);
  }

  return formatDateForAPI(targetDate);
}

/**
 * Format a Date object as YYYY-MM-DD for the API
 */
function formatDateForAPI(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}









