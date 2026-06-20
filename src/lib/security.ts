/**
 * Security Utility Library
 * Provides input validation, HTML escaping, and formula injection protection.
 */

/**
 * Escapes HTML characters to prevent XSS/HTML injection.
 */
export function sanitizeString(val: any): string {
  if (typeof val !== "string") {
    return val ? String(val) : "";
  }
  return val
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

/**
 * Prefixes strings with a single quote if they start with formula triggers (=, +, -, @)
 * to prevent Spreadsheet/CSV Formula Injection.
 */
export function sanitizeFormula(val: any): string {
  if (typeof val !== "string") {
    return val ? String(val) : "";
  }
  const trimmed = val.trim();
  if (
    trimmed.startsWith("=") ||
    trimmed.startsWith("+") ||
    trimmed.startsWith("-") ||
    trimmed.startsWith("@")
  ) {
    return `'${trimmed}`;
  }
  return trimmed;
}

/**
 * Validates travel addresses for safe length and content.
 */
export function validateAddress(address: any): boolean {
  if (typeof address !== "string") return false;
  const trimmed = address.trim();
  if (trimmed.length < 3 || trimmed.length > 250) return false;
  if (/<script/i.test(trimmed) || /javascript:/i.test(trimmed)) return false;
  return true;
}
