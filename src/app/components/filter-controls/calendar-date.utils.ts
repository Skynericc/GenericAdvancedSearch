/** Parse API calendar values as local dates, avoiding UTC shifts from Date.parse. */
export function parseCalendarDate(value: unknown): Date | null {
  if (value instanceof Date) {
    return isValidDate(value) ? new Date(value.getFullYear(), value.getMonth(), value.getDate()) : null;
  }

  if (typeof value === 'number') {
    if (Number.isInteger(value) && value >= 1000 && value <= 9999) return new Date(value, 0, 1);
    const parsed = new Date(value);
    return isValidDate(parsed) ? new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate()) : null;
  }

  if (typeof value !== 'string' || !value.trim()) return null;

  const iso = /^(\d{4})-(\d{2})(?:-(\d{2}))?/.exec(value.trim());
  if (iso) {
    const year = Number(iso[1]);
    const month = Number(iso[2]);
    const day = iso[3] ? Number(iso[3]) : 1;
    const parsed = new Date(year, month - 1, day);
    return parsed.getFullYear() === year && parsed.getMonth() === month - 1 && parsed.getDate() === day
      ? parsed
      : null;
  }

  const parsed = new Date(value);
  return isValidDate(parsed) ? new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate()) : null;
}

function isValidDate(value: Date): boolean { return !Number.isNaN(value.getTime()); }
