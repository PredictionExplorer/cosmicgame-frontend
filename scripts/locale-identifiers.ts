/**
 * The identifier convention of per-locale copy modules (docs/i18n/README.md
 * §3.2): `faqTextEn` / `faqTextZhTw` / `TERMS_COPY_EN` / `TERMS_COPY_ZH_TW`,
 * with sibling imports `from './text.zh-TW'`. Shared by the variant-derivation
 * and locale-scaffold commands, which both write a module for one locale from
 * another's.
 */

/** `zh-TW` → `{ camel: 'ZhTw', upper: 'ZH_TW' }`; `en` → `{ camel: 'En', upper: 'EN' }`. */
export function identifierSuffix(locale: string): { camel: string; upper: string } {
  const parts = locale.split('-');
  return {
    camel: parts.map((part) => part[0]!.toUpperCase() + part.slice(1).toLowerCase()).join(''),
    upper: parts.map((part) => part.toUpperCase()).join('_'),
  };
}

/** Renames a copy module's exports and sibling imports from one locale to another. */
export function renameIdentifiers(source: string, from: string, to: string): string {
  const fromSuffix = identifierSuffix(from);
  const toSuffix = identifierSuffix(to);
  return source
    .replace(
      new RegExp(`\\b([A-Za-z][A-Za-z0-9]*)${fromSuffix.camel}\\b`, 'g'),
      `$1${toSuffix.camel}`,
    )
    .replace(new RegExp(`\\b([A-Z][A-Z0-9_]*)_${fromSuffix.upper}\\b`, 'g'), `$1_${toSuffix.upper}`)
    .replace(new RegExp(`(from '\\./[^']*\\.)${from}'`, 'g'), `$1${to}'`);
}

/**
 * The file name of a copy module for `to`, given its `from` counterpart:
 * `en.ts` → `ko.ts`, `text.basic.en.ts` → `text.basic.ko.ts`.
 */
export function localeModuleName(fileName: string, from: string, to: string): string | undefined {
  if (fileName === `${from}.ts`) return `${to}.ts`;
  if (fileName.endsWith(`.${from}.ts`))
    return `${fileName.slice(0, -`.${from}.ts`.length)}.${to}.ts`;
  return undefined;
}
