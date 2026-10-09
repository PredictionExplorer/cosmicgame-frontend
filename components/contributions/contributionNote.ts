/**
 * The public note an ETH contribution can carry: the JSON the contribution
 * form writes with `donateEthWithInfo`, and the record page reads back.
 */
export interface ContributionNote {
  title: string;
  message: string;
  url: string;
}

export const EMPTY_NOTE: ContributionNote = { title: '', message: '', url: '' };

/** True for an empty link or a full http(s) URL: the only links a note may carry. */
export function isNoteUrl(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return true;
  try {
    const url = new URL(trimmed);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * The note as the JSON `donateEthWithInfo` stores, with empty fields left
 * out; `null` when the note is empty, so the plain `donateEth` is used.
 */
export function contributionPayload(note: ContributionNote): string | null {
  const entries = Object.entries(note)
    .map(([key, value]) => [key, value.trim()] as const)
    .filter(([, value]) => value.length > 0);
  return entries.length > 0 ? JSON.stringify(Object.fromEntries(entries)) : null;
}

/** A stored note as the record page shows it. */
export type ParsedContributionNote =
  | { kind: 'none' }
  /** The form's JSON: its text fields, and the link only when it is http(s). */
  | { kind: 'note'; title: string | null; message: string | null; url: string | null }
  /** Anything else a contract call stored (plain text, other JSON): shown as written. */
  | { kind: 'raw'; text: string };

function textField(record: Record<string, unknown>, key: string): string | null {
  const value = record[key];
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

/**
 * Reads a contribution's stored note. The contract takes any string, so a
 * note that is not the form's JSON is still shown, as stored, rather than
 * silently dropped; a link that is not http(s) is never made clickable.
 */
export function parseContributionNote(stored: unknown): ParsedContributionNote {
  if (typeof stored !== 'string' || !stored.trim()) return { kind: 'none' };
  let parsed: unknown;
  try {
    parsed = JSON.parse(stored);
  } catch {
    return { kind: 'raw', text: stored.trim() };
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return { kind: 'raw', text: stored.trim() };
  }
  const record = parsed as Record<string, unknown>;
  const title = textField(record, 'title');
  const message = textField(record, 'message');
  const link = textField(record, 'url');
  const url = link && isNoteUrl(link) ? link : null;
  if (!title && !message && !url) return { kind: 'raw', text: stored.trim() };
  return { kind: 'note', title, message, url };
}
