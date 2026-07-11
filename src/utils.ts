/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const parseLocalDateTime = (isoString: string | undefined): Date => {
  if (!isoString) return new Date();
  try {
    const trimmed = isoString.trim();
    // Normalize space to T
    const normalized = trimmed.replace(" ", "T");
    
    // Check if it's already an ISO UTC string (ends with Z or has offset)
    if (normalized.endsWith("Z") || normalized.includes("+") || (normalized.includes("-") && normalized.split("-").length > 3)) {
      const d = new Date(normalized);
      if (!isNaN(d.getTime())) return d;
    }
    
    // Manual local parts extraction
    const parts = normalized.split("T");
    const dateParts = parts[0].split("-");
    const year = parseInt(dateParts[0], 10);
    const month = parseInt(dateParts[1], 10) - 1;
    const day = parseInt(dateParts[2], 10);
    
    let hours = 0;
    let minutes = 0;
    let seconds = 0;
    if (parts[1]) {
      const timeParts = parts[1].split(":");
      hours = parseInt(timeParts[0], 10) || 0;
      minutes = parseInt(timeParts[1], 10) || 0;
      if (timeParts[2]) {
        seconds = parseInt(timeParts[2].split(".")[0], 10) || 0;
      }
    }
    
    if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
      const d = new Date(year, month, day, hours, minutes, seconds);
      if (!isNaN(d.getTime())) return d;
    }
    
    // Ultimate fallback
    const dFallback = new Date(normalized);
    if (!isNaN(dFallback.getTime())) return dFallback;
    return new Date();
  } catch (e) {
    const dErr = new Date(isoString || "");
    if (!isNaN(dErr.getTime())) return dErr;
    return new Date();
  }
};

/**
 * Parses a date-time string in "YYYY-MM-DDTHH:MM:SS" (or similar) local format
 * and returns a formatted string without any timezone shift issues.
 */
export const formatDateTime = (
  isoString: string | undefined,
  formatType: "full" | "short" | "time" | "datetime" = "full"
): string => {
  if (!isoString) return "";
  try {
    // "2026-09-05T18:00:00" -> ["2026-09-05", "18:00:00"]
    const parts = isoString.split("T");
    const dateParts = parts[0].split("-");
    const year = parseInt(dateParts[0], 10);
    const month = parseInt(dateParts[1], 10) - 1;
    const day = parseInt(dateParts[2], 10);
    
    let hours = 0;
    let minutes = 0;
    if (parts[1]) {
      const timeParts = parts[1].split(":");
      hours = parseInt(timeParts[0], 10);
      minutes = parseInt(timeParts[1], 10);
    }
    
    const d = new Date(year, month, day, hours, minutes);
    
    if (formatType === "short") {
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    } else if (formatType === "time") {
      return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    } else if (formatType === "datetime") {
      const dateStr = d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
      const timeStr = d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
      return `${dateStr} at ${timeStr}`;
    } else {
      return d.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
    }
  } catch (e) {
    return isoString;
  }
};
