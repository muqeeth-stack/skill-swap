/**
 * Deterministic date & time formatting utilities for SynapseLearn
 * Prevents SSR / client React hydration mismatches caused by locale differences.
 */

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

export function formatDate(dateInput: string | number | Date | null | undefined): string {
  if (!dateInput) return "";
  try {
    const d = typeof dateInput === "object" ? dateInput : new Date(dateInput);
    if (isNaN(d.getTime())) return "";
    const month = MONTHS[d.getUTCMonth()];
    const day = d.getUTCDate();
    const year = d.getUTCFullYear();
    return `${month} ${day}, ${year}`;
  } catch {
    return "";
  }
}

export function formatDateTime(dateInput: string | number | Date | null | undefined): string {
  if (!dateInput) return "";
  try {
    const d = typeof dateInput === "object" ? dateInput : new Date(dateInput);
    if (isNaN(d.getTime())) return "";
    const datePart = formatDate(d);
    const hours = String(d.getUTCHours()).padStart(2, "0");
    const minutes = String(d.getUTCMinutes()).padStart(2, "0");
    return `${datePart} ${hours}:${minutes} UTC`;
  } catch {
    return "";
  }
}

export function formatTime(dateInput: string | number | Date | null | undefined): string {
  if (!dateInput) return "";
  try {
    const d = typeof dateInput === "object" ? dateInput : new Date(dateInput);
    if (isNaN(d.getTime())) return "";
    const hours = String(d.getUTCHours()).padStart(2, "0");
    const minutes = String(d.getUTCMinutes()).padStart(2, "0");
    return `${hours}:${minutes} UTC`;
  } catch {
    return "";
  }
}

export function daysFromNowISO(days: number): string {
  return new Date(Date.now() + days * 86400000).toISOString();
}
