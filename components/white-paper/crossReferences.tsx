import type { ReactNode } from 'react';

import type { WhitePaperContent } from '@/content/white-paper';

import { pickByLocale, type LocaleRecord } from '@/i18n/locale';
import { Link } from '@/i18n/navigation';

/**
 * The paper's cross-references ("Section 5.2", "第 5.2 节", "5.2절",
 * "Appendix A") as links to the sections they name, in the web edition only:
 * the copy stays plain text, so the PDF generator and every locale's wording
 * are untouched. Each locale's pattern captures, in the first group that
 * matched: the first section of a range or pair ("Sections 3 through 5",
 * "розділах 12 і 13", "3~5절"), which the whole range links to, so a
 * paragraph never reads as a patchwork of linked and plain references; a
 * single section number; or an appendix letter. Japanese writes each end
 * of a range as its own reference (第3節から第5節), so both ends link.
 * Spaces match any whitespace: the copy keeps a number with its measure word
 * or noun by a no-break space (第 12 节, розділ 5).
 */
const NUM = String.raw`\d+(?:\.\d+)?`;
const REFERENCE_PATTERNS: LocaleRecord<RegExp> = {
  en: new RegExp(
    String.raw`\bSections\s(${NUM})\s(?:through|to|and)\s${NUM}|\bSection\s(${NUM})|\bAppendix\s([AB])\b`,
    'g',
  ),
  zh: new RegExp(
    String.raw`第\s?(${NUM})\s?(?:至|、)\s?${NUM}\s?节|第\s?(${NUM})\s?节|附录\s?([AB])`,
    'g',
  ),
  'zh-TW': new RegExp(
    String.raw`第\s?(${NUM})\s?(?:至|、)\s?${NUM}\s?節|第\s?(${NUM})\s?節|附錄\s?([AB])`,
    'g',
  ),
  'zh-HK': new RegExp(
    String.raw`第\s?(${NUM})\s?(?:至|、)\s?${NUM}\s?節|第\s?(${NUM})\s?節|附錄\s?([AB])`,
    'g',
  ),
  uk: new RegExp(
    String.raw`[Рр]озділ(?:и|ах)\s(${NUM})(?:–|\sі\s|\sта\s)${NUM}|[Рр]озділ(?:і|у|а)?\s(${NUM})|[Дд]одат(?:ок|ку|ка)\s([AB])`,
    'g',
  ),
  ko: new RegExp(String.raw`(${NUM})~${NUM}절|(${NUM})절|부록\s?([AB])`, 'g'),
  ja: new RegExp(String.raw`第(${NUM})節|付録([AB])`, 'g'),
  vi: new RegExp(
    String.raw`[Cc]ác\smục\s(${NUM})\s(?:đến|và)\s${NUM}|Mục\s(${NUM})(?!\s(?:và|đến)\s\d)|Phụ\slục\s([AB])`,
    'g',
  ),
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
    const id = targets.get(match[1] ?? match[2] ?? match[3] ?? '');
    if (!id || match.index === undefined) continue;
    if (match.index > last) parts.push(text.slice(last, match.index));
    parts.push({ text: match[0], id });
    last = match.index + match[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

/**
 * A reference as a link's text: each number kept on the line of the word
 * before it and the measure word after it ("Section 11.3", "第 5.2 节",
 * "Sections 3 through 5"), so the link never breaks between them and never
 * reads as two links. Scripts that set no spaces (第3.1節) may break between
 * any two characters, so the link itself also never wraps (REFERENCE_CLASS).
 */
export function referenceText(text: string): string {
  return text.replace(/\s(?=\d)|(?<=\d)\s/gu, '\u00a0');
}

/** A reference link is one unbreakable phrase, in every script. */
const REFERENCE_CLASS = 'link whitespace-nowrap';

/**
 * Renders text with its cross-references as links: to the sections of this
 * page, or, with `paperPath` (the white paper's own path), to the paper's
 * sections from another page.
 */
export function withReferences(
  text: string,
  locale: string,
  targets: ReadonlyMap<string, string>,
  paperPath?: string,
): ReactNode {
  const parts = splitReferences(text, locale, targets);
  if (parts.length === 1 && typeof parts[0] === 'string') return text;
  return parts.map((part, index) => {
    if (typeof part === 'string') return part;
    const key = `${index}-${part.id}`;
    const label = referenceText(part.text);
    return paperPath ? (
      <Link key={key} href={`${paperPath}#${part.id}`} className={REFERENCE_CLASS}>
        {label}
      </Link>
    ) : (
      <a key={key} href={`#${part.id}`} className={REFERENCE_CLASS}>
        {label}
      </a>
    );
  });
}
