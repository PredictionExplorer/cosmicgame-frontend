import { LEARN_LINK_TARGETS, type LearnLinkTarget } from './structure';

/**
 * Inline links in a guide's prose: `[label](key)`, where `key` is one of
 * LEARN_LINK_TARGETS. The label is the locale's own words; the target is
 * declared once in structure.ts.
 */
const LINK_TOKEN = /\[([^\]]+)\]\((\w+)\)/g;

/** One piece of a paragraph: plain text, or a label that links to a target. */
export type LearnTextPart = string | { readonly label: string; readonly target: LearnLinkTarget };

export function isLearnLinkTarget(key: string): key is LearnLinkTarget {
  return Object.prototype.hasOwnProperty.call(LEARN_LINK_TARGETS, key);
}

/**
 * Splits a paragraph at its link tokens. A token naming no known target
 * keeps only its label, as text, so markup never reaches the page.
 */
export function splitLearnLinks(text: string): LearnTextPart[] {
  const parts: LearnTextPart[] = [];
  let pending = '';
  let last = 0;
  for (const match of text.matchAll(LINK_TOKEN)) {
    const [token, label = '', key = ''] = match;
    const index = match.index ?? 0;
    pending += text.slice(last, index);
    last = index + token.length;
    if (!isLearnLinkTarget(key)) {
      pending += label;
      continue;
    }
    if (pending) parts.push(pending);
    pending = '';
    parts.push({ label, target: key });
  }
  pending += text.slice(last);
  if (pending) parts.push(pending);
  return parts;
}

/** The paragraph as readers see it: every link token reduced to its label. */
export function learnPlainText(text: string): string {
  return text.replace(LINK_TOKEN, '$1');
}

/** The target keys a paragraph names, in order, known or not (the content tests check them). */
export function learnLinkKeys(text: string): string[] {
  return [...text.matchAll(LINK_TOKEN)].map((match) => match[2] ?? '');
}
