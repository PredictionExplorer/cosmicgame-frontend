import { protocolFacts } from '@/content/protocol-facts';

import { getLocaleConfig } from '@/i18n/localeConfig';
import type { AppLocale } from '@/i18n/routing';
import { formatCount, formatNumber } from '@/utils/format/numbers';

/** A word's forms by the plural category of the number before it; `other` is required. */
export type PluralForms = Partial<Record<Intl.LDMLPluralRule, string>> & {
  readonly other: string;
};

/**
 * The protocol numbers the how-it-works copy states, formatted for one
 * locale through the shared format layer (the locale's grouping and decimal
 * marks come from `i18n/localeConfig.ts`, never a tag typed into a copy
 * module), plus a plural picker for the words that agree with a count.
 * The recipient counts come from `protocolFacts`, so a Cosmic Council change
 * to them changes the prose with them rather than leaving it stale.
 */
export function copyNumbers(locale: AppLocale) {
  const rules = new Intl.PluralRules(getLocaleConfig(locale).intlLocale);
  return {
    /** A whole number in the locale's grouping ("1,000", uk "1 000", vi "1.000"). */
    count: (value: number) => formatCount(value, locale),
    /** A decimal in the locale's marks ("0.398", vi "0,398"). */
    decimal: (value: number) => formatNumber(value, locale),
    /** The form of a word that agrees with `value` (uk: 3 записи, 10 записів). */
    plural: (value: number, forms: PluralForms) => forms[rules.select(value)] ?? forms.other,
    /** CST in each special allocation. */
    specialAllocationCst: formatCount(protocolFacts.specialAllocationCst, locale),
    /** Stellar Selection recipients per finalization, by selection. */
    ethRecipients: protocolFacts.ethStellarSelectionRecipients,
    nftRecipients: protocolFacts.nftStellarSelectionRecipients,
    anchoredRecipients: protocolFacts.anchoredRwlkNftSelectionRecipients,
  };
}
