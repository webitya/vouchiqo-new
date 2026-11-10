/**
 * Utility functions for strict time formatting, validation, and standard 12h AM/PM options.
 */

// 48 standard 30-minute interval options across a 24-hour day
export const STANDARD_TIME_OPTIONS = [
  "06:00 AM",
  "06:30 AM",
  "07:00 AM",
  "07:30 AM",
  "08:00 AM",
  "08:30 AM",
  "09:00 AM",
  "09:30 AM",
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "11:30 AM",
  "12:00 PM",
  "12:30 PM",
  "01:00 PM",
  "01:30 PM",
  "02:00 PM",
  "02:30 PM",
  "03:00 PM",
  "03:30 PM",
  "04:00 PM",
  "04:30 PM",
  "05:00 PM",
  "05:30 PM",
  "06:00 PM",
  "06:30 PM",
  "07:00 PM",
  "07:30 PM",
  "08:00 PM",
  "08:30 PM",
  "09:00 PM",
  "09:30 PM",
  "10:00 PM",
  "10:30 PM",
  "11:00 PM",
  "11:30 PM",
  "12:00 AM",
  "12:30 AM",
  "01:00 AM",
  "01:30 AM",
  "02:00 AM",
  "02:30 AM",
  "03:00 AM",
  "03:30 AM",
  "04:00 AM",
  "04:30 AM",
  "05:00 AM",
  "05:30 AM",
];

/**
 * Normalizes any time string (e.g. "10am", "10:00am", "20:00", "9:30 pm") into strict "hh:mm AM/PM" format.
 * Returns defaultFallback if the value is missing or unparseable.
 */
export function normalizeTimeFormat(rawStr, defaultFallback = "10:00 AM") {
  if (!rawStr || typeof rawStr !== "string") return defaultFallback;

  const trimmed = rawStr.trim().toUpperCase();

  // If already exactly in STANDARD_TIME_OPTIONS, return immediately
  if (STANDARD_TIME_OPTIONS.includes(trimmed)) {
    return trimmed;
  }

  // Regex pattern for hh:mm AM/PM or h:mm AM/PM
  const ampmRegex = /^(\d{1,2})[:.]?(\d{2})?\s*(AM|PM)?$/i;
  const match = trimmed.match(ampmRegex);

  if (match) {
    let hours = parseInt(match[1], 10);
    let minutes = match[2] ? parseInt(match[2], 10) : 0;
    let period = match[3] ? match[3].toUpperCase() : null;

    if (hours < 0 || hours > 24 || minutes < 0 || minutes > 59) {
      return defaultFallback;
    }

    // Handle 24-hour format if period is missing
    if (!period) {
      if (hours === 0) {
        hours = 12;
        period = "AM";
      } else if (hours === 12) {
        period = "PM";
      } else if (hours > 12) {
        hours = hours - 12;
        period = "PM";
      } else {
        period = "AM";
      }
    }

    const formattedHours = hours.toString().padStart(2, "0");
    const formattedMinutes = minutes.toString().padStart(2, "0");
    const result = `${formattedHours}:${formattedMinutes} ${period}`;

    return result;
  }

  return defaultFallback;
}

/**
 * Validates whether a given time string is in valid 12-hour AM/PM format.
 */
export function isValid12HourTime(str) {
  if (!str || typeof str !== "string") return false;
  const regex = /^(0[1-9]|1[0-2]):[0-5][0-9] (AM|PM)$/;
  return regex.test(str.trim());
}
