/** One heading in a document's contents: its anchor, number and title, and its subsections. */
export interface ContentsEntry {
  /** The id of the element the entry links to (`#id`). */
  id: string;
  label: string;
  /** Section number as printed ("5", "5.2", "A"); omitted for unnumbered headings. */
  number?: string;
  children?: readonly ContentsEntry[];
}

/** The copy the contents rail and the phone contents sheet need. */
export interface ContentsCopy {
  /**
   * The rail's label ("On this page"): the visible label above the list and
   * the name of its navigation landmark, the same words on every reading page
   * (legal.document.contents).
   */
  railLabel: string;
  /** Label of the floating button that opens the list on phones ("Contents"). */
  openLabel: string;
  /** The rail's link back to the top of the document. */
  backToTopLabel: string;
}

/** Every anchor in reading order: each section, then its subsections. */
export function flattenContents(entries: readonly ContentsEntry[]): string[] {
  return entries.flatMap((entry) => [entry.id, ...flattenContents(entry.children ?? [])]);
}

/** The top-level entry whose branch holds `id` (the entry itself or one of its subsections). */
export function branchOf(entries: readonly ContentsEntry[], id: string | null): string | null {
  if (!id) return null;
  for (const entry of entries) {
    if (entry.id === id || flattenContents(entry.children ?? []).includes(id)) return entry.id;
  }
  return null;
}

/** The entry with this id, at any depth. */
export function findEntry(
  entries: readonly ContentsEntry[],
  id: string | null,
): ContentsEntry | null {
  if (!id) return null;
  for (const entry of entries) {
    if (entry.id === id) return entry;
    const child = findEntry(entry.children ?? [], id);
    if (child) return child;
  }
  return null;
}
