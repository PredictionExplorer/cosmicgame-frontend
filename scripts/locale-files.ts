/**
 * Which locale, if any, owns a repository file. Shared by the lexicon scanner,
 * the terminology gate, and the script-conventions gate so the three agree on
 * ownership, and so a locale code containing a hyphen (`zh-TW`) is matched as
 * a whole segment — `zh` never claims `text.zh-TW.ts`.
 *
 * Conventions (docs/i18n/README.md §3):
 *
 *   messages/<locale>/…                 message catalogs
 *   content/**\/<locale>.ts             small copy modules (content/about)
 *   content/**\/<stem>.<locale>.ts(x)   structure/text split and legal copy
 *                                       (`text.zh-TW.ts`, `text.basic.zh.ts`,
 *                                       `TermsContent.zh-HK.ts`)
 *   e2e/<locale>-*.spec.ts, e2e/<locale>-*.ts
 *                                       per-locale suites and helpers
 *
 * Everything else (components, shared structure modules, English-only
 * docs) is locale-agnostic and returns `undefined`.
 */

import { getLocaleConfig } from '../i18n/localeConfig';
import { routing, type AppLocale } from '../i18n/routing';

const LOCALES_LONGEST_FIRST: readonly AppLocale[] = [...routing.locales].sort(
  (a, b) => b.length - a.length,
);

function asLocale(segment: string | undefined): AppLocale | undefined {
  if (!segment) return undefined;
  const lower = segment.toLowerCase();
  return routing.locales.find((locale) => locale.toLowerCase() === lower);
}

/** The locale a repository-relative (or absolute) path belongs to, if any. */
export function fileLocale(path: string): AppLocale | undefined {
  const segments = path.replace(/\\/g, '/').split('/');
  const file = segments[segments.length - 1] ?? '';

  const messagesIndex = segments.lastIndexOf('messages');
  if (messagesIndex !== -1 && segments.length > messagesIndex + 2) {
    const owner = asLocale(segments[messagesIndex + 1]);
    if (owner) return owner;
  }

  if (segments.includes('content')) {
    // `text.zh-TW.ts` → ['text', 'zh-TW', 'ts']; `zh-TW.ts` → ['zh-TW', 'ts'].
    const parts = file.split('.');
    if (parts.length >= 2) {
      const owner = asLocale(parts[parts.length - 2]);
      if (owner) return owner;
    }
  }

  if (segments.includes('e2e')) {
    const lower = file.toLowerCase();
    for (const locale of LOCALES_LONGEST_FIRST) {
      if (lower.startsWith(`${locale.toLowerCase()}-`)) return locale;
    }
  }

  return undefined;
}

/** BCP 47 language subtag of a locale (`zh-TW` → `zh`). */
export function localeLanguage(locale: AppLocale): string {
  return new Intl.Locale(locale).language;
}

/**
 * Whether a locale-specific check (banned register, terminology pack) applies
 * to a file. A locale-agnostic file gets every check — stray translated copy
 * in the wrong place is exactly what the gates exist to catch. A file owned
 * by a locale gets its own check plus the checks of every other language
 * written in a different family of characters. Two kinds of neighbour are
 * skipped because they share characters while differing in vocabulary:
 * sibling variants of the same language (Hong Kong bans 回報 "return", Taiwan
 * writes 回報問題 "report an issue"), and other languages of the same
 * `ScriptFamily` (Japanese bans 利益 "profit" where Chinese 利益 "interest" is
 * ordinary; Taiwan bans 報酬 "return" where Japanese 報酬 is a plain
 * "remuneration"). Korean and Ukrainian checks still run on Japanese and
 * Chinese files, where they can only match genuinely stray copy.
 */
export function checkAppliesTo(checkLocale: AppLocale, owner: AppLocale | undefined): boolean {
  if (owner === undefined || owner === checkLocale) return true;
  if (localeLanguage(owner) === localeLanguage(checkLocale)) return false;
  return getLocaleConfig(owner).scriptFamily !== getLocaleConfig(checkLocale).scriptFamily;
}
