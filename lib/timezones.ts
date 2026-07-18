// All IANA timezones grouped by region for the picker
export const TIMEZONE_GROUPS: Record<string, string[]> = {
  "Europe": [
    "Europe/London", "Europe/Dublin", "Europe/Lisbon",
    "Europe/Madrid", "Europe/Paris", "Europe/Rome", "Europe/Berlin",
    "Europe/Amsterdam", "Europe/Brussels", "Europe/Vienna", "Europe/Zurich",
    "Europe/Stockholm", "Europe/Oslo", "Europe/Copenhagen", "Europe/Helsinki",
    "Europe/Warsaw", "Europe/Prague", "Europe/Budapest", "Europe/Bucharest",
    "Europe/Athens", "Europe/Istanbul", "Europe/Moscow", "Europe/Kiev",
  ],
  "Americas": [
    "America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles",
    "America/Phoenix", "America/Anchorage", "America/Honolulu",
    "America/Toronto", "America/Vancouver", "America/Montreal",
    "America/Mexico_City", "America/Bogota", "America/Lima",
    "America/Santiago", "America/Buenos_Aires", "America/Sao_Paulo",
    "America/Caracas", "America/Montevideo",
  ],
  "Asia": [
    "Asia/Dubai", "Asia/Riyadh", "Asia/Kuwait", "Asia/Baghdad",
    "Asia/Tehran", "Asia/Karachi", "Asia/Kolkata", "Asia/Dhaka",
    "Asia/Bangkok", "Asia/Jakarta", "Asia/Singapore", "Asia/Hong_Kong",
    "Asia/Shanghai", "Asia/Tokyo", "Asia/Seoul", "Asia/Taipei",
    "Asia/Manila", "Asia/Kuala_Lumpur",
  ],
  "Africa": [
    "Africa/Cairo", "Africa/Johannesburg", "Africa/Lagos",
    "Africa/Nairobi", "Africa/Casablanca", "Africa/Tunis",
    "Africa/Accra", "Africa/Addis_Ababa",
  ],
  "Oceania": [
    "Australia/Sydney", "Australia/Melbourne", "Australia/Brisbane",
    "Australia/Perth", "Australia/Adelaide", "Pacific/Auckland",
    "Pacific/Fiji", "Pacific/Honolulu",
  ],
};

export const ALL_TIMEZONES = Object.values(TIMEZONE_GROUPS).flat();

// Format a timezone for display: "Europe/Madrid" → "Madrid (Europe)"
export function formatTimezone(tz: string): string {
  const parts = tz.split("/");
  const city = parts[parts.length - 1].replace(/_/g, " ");
  const region = parts[0];
  return `${city} (${region})`;
}

// Convert a UTC hour slot (HH:00) to the driver's local time label
export function utcSlotToLocal(utcSlot: string, timezone: string): string {
  try {
    const [h] = utcSlot.split(":").map(Number);
    const date = new Date();
    date.setUTCHours(h, 0, 0, 0);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: timezone,
    });
  } catch {
    return utcSlot;
  }
}

// Convert driver's local HH:00 to UTC HH:00 for storage
export function localSlotToUtc(localHour: number, timezone: string): string {
  try {
    // Find what UTC hour corresponds to localHour in the given timezone
    const today = new Date();
    // Try each UTC hour and see which one maps to the desired local hour
    for (let utcH = 0; utcH < 24; utcH++) {
      const d = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate(), utcH, 0, 0));
      const localH = parseInt(
        d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: timezone }).split(":")[0]
      );
      if (localH === localHour) {
        return `${String(utcH).padStart(2, "0")}:00`;
      }
    }
    return `${String(localHour).padStart(2, "0")}:00`;
  } catch {
    return `${String(localHour).padStart(2, "0")}:00`;
  }
}

// Get current local time label for a timezone
export function getCurrentLocalTime(timezone: string): string {
  try {
    return new Date().toLocaleTimeString("en-US", {
      hour: "2-digit", minute: "2-digit", hour12: false, timeZone: timezone,
    });
  } catch {
    return "";
  }
}

// Get all 24 local hours as display labels for the driver's timezone
export function getLocalHourLabels(timezone: string): { display: string; utcSlot: string }[] {
  return Array.from({ length: 24 }, (_, localHour) => ({
    display: `${String(localHour).padStart(2, "0")}:00`,
    utcSlot: localSlotToUtc(localHour, timezone),
  }));
}
