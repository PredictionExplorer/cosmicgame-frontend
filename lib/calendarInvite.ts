/**
 * Builds a downloadable iCalendar (.ics) data URI for a single event, so
 * visitors can put the next cycle's opening on their calendar without any
 * backend involvement. RFC 5545 requires CRLF line endings and escaped
 * commas/semicolons in text fields.
 */

function toIcsUtcStamp(unixSeconds: number): string {
  const date = new Date(unixSeconds * 1000);
  const pad = (value: number) => String(value).padStart(2, '0');
  return (
    `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}` +
    `T${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}Z`
  );
}

function escapeIcsText(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

export interface CalendarInviteInput {
  /** Stable identifier (e.g. `cosmic-cycle-3-opening`). */
  uid: string;
  title: string;
  description: string;
  url: string;
  /** Unix seconds. */
  startSeconds: number;
  /** Defaults to 30 minutes after start. */
  endSeconds?: number;
}

export function buildCalendarInviteDataUri({
  uid,
  title,
  description,
  url,
  startSeconds,
  endSeconds,
}: CalendarInviteInput): string {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Cosmic Signature//Cycle Calendar//EN',
    'BEGIN:VEVENT',
    `UID:${uid}@cosmicsignature.com`,
    `DTSTAMP:${toIcsUtcStamp(Math.floor(Date.now() / 1000))}`,
    `DTSTART:${toIcsUtcStamp(startSeconds)}`,
    `DTEND:${toIcsUtcStamp(endSeconds ?? startSeconds + 30 * 60)}`,
    `SUMMARY:${escapeIcsText(title)}`,
    `DESCRIPTION:${escapeIcsText(description)}`,
    `URL:${url}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ];
  return `data:text/calendar;charset=utf-8,${encodeURIComponent(lines.join('\r\n'))}`;
}
