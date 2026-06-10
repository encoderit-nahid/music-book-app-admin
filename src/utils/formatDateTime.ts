
/**
 * Converts a local Date object to a UTC string in "YYYY-MM-DD HH:mm:ss" format
 * Use this when SENDING data to the backend
 */
export const formatDateTimeUTC = (date?: Date): string => {
  if (!date) return "";
  return date.toISOString().replace("T", " ").split(".")[0];
};

/**
 * Parses a UTC string back into a local Date object
 * Use this when RECEIVING data from the backend for DatePicker components
 */
export const parseDateTimeUTC = (value?: string): Date | undefined => {
  if (!value) return undefined;
  // Ensure the 'Z' is present so the browser treats the string as UTC
  const utcString = value.includes("Z") ? value : `${value.replace(" ", "T")}Z`;
  const date = new Date(utcString);
  return isNaN(date.getTime()) ? undefined : date;
};

/**
 * Formats a UTC datetime string for display in the user's local timezone
 * Use this when DISPLAYING data to the user
 */
export const formatDateTime = (value?: string | null) => {
  if (!value) return null;

  // Parse the UTC string to a local Date object
  const date = parseDateTimeUTC(value);
  if (!date) return null;

  // Format date: "9 Nov 2025"
  const day = date.getDate();
  const month = date.toLocaleDateString("en-US", { month: "short" });
  const year = date.getFullYear();
  const dateStr = `${day} ${month} ${year}`;

  // Format time: "5PM" or "5:30PM"
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12; // Convert to 12-hour format
  
  // Only show minutes if they're not zero
  const timeStr = minutes === 0 ? `${hours}${ampm}` : `${hours}:${minutes.toString().padStart(2, "0")}${ampm}`;

  return { dateStr, timeStr, fullDate: date };
};

/**
 * Gets a countdown from now to a target UTC date string
 * Returns the target date in local timezone
 */
export const parseUTCForCountdown = (utcDateString: string | null): Date | null => {
  if (!utcDateString) return null;
  const date = parseDateTimeUTC(utcDateString);
  return date || null;
};