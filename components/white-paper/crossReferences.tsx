import type { ReactNode } from 'react';

import type { WhitePaperContent } from '@/content/white-paper';

import { pickByLocale, type LocaleRecord } from '@/i18n/locale';

/**
 * The paper's cross-references ("Section 5.2", "第 5.2 节", "5.2절",
 * "Appendix A") as links to the sections they name, in the web edition only:
 * the copy stays plain text, so the PDF generator and every locale's wording
 * are untouched. Each locale's pattern captures a section number in group 1
 * or an appendix letter in group 2. Ranges and pairs ("Sections 3 through
 * 5", "розділах 12 і 13", "Mục 12 và 13") stay plain text: one link could
 * name only one of their sections.
 */
const REFERENCE_PATTERNS: LocaleRecord<RegExp> = {
  en: /\bSection (\d+(?:\.\d+)?)|\bAppendix ([AB])\b/g,
  zh: /第 ?(\d+(?:\.\d+)?) ?节|附录 ?([AB])/g,
  'zh-TW': /第 ?(\d+(?:\.\d+)?) ?節|附錄 ?([AB])/g,
  'zh-HK': /第 ?(\d+(?:\.\d+)?) ?節|附錄 ?([AB])/g,
  uk: /[Рр]озділ(?:і|у|а)? (\d+(?:\.\d+)?)|[Дд]одат(?:ок|ку|ка) ([AB])/g,
  ko: /(\d+(?:\.\d+)?)절|부록 ?([AB])/g,
  ja: /第(\d+(?:\.\d+)?)節|付録([AB])/g,
  vi: /Mục (\d+(?:\.\d+)?)(?! (?:và|đến) \d)|Phụ lục ([AB])/g,
};

/** Section and appendix anchors by the number or letter the copy uses for them. */
export function referenceTargets(content: WhitePaperContent): ReadonlyMap<string, string> {
  const targets = new Map<string, string>();
  for (const section of content.sections) {
    targets.set(section.number, section.id);
    for (const subsection of section.subsections ?? []) {
      targets.set(subsection.number, subsection.id);
    }
  }
  return targets;
}

/** One piece of a paragraph: plain text, or a reference and the anchor it names. */
export type ReferencePart = string | { text: string; id: string };

/** Splits text at its cross-references; a reference to no known section stays text. */
export function splitReferences(
  text: string,
  locale: string,
  targets: ReadonlyMap<string, string>,
): ReferencePart[] {
  const pattern = new RegExp(pickByLocale(REFERENCE_PATTERNS, locale).source, 'g');
  const parts: ReferencePart[] = [];
  let last = 0;
  for (const match of text.matchAll(pattern)) {
    const id = targets.get(match[1] ?? match[2] ?? '');
    if (!id || match.index === undefined) continue;
    if (match.index > last) parts.push(text.slice(last, match.index));
    parts.push({ text: match[0], id });
    last = match.index + match[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

/** Renders text with its cross-references as in-page links. */
export function withReferences(
  text: string,
  locale: string,
  targets: ReadonlyMap<string, string>,
): ReactNode {
  const parts = splitReferences(text, locale, targets);
  if (parts.length === 1 && typeof parts[0] === 'string') return text;
  return parts.map((part, index) =>
    typeof part === 'string' ? (
      part
    ) : (
      <a key={`${index}-${part.id}`} href={`#${part.id}`} className="link">
        {part.text}
      </a>
    ),
  );
}
