import { ArrowRight } from 'lucide-react';
import { getLocale, getTranslations } from 'next-intl/server';

import { Link } from '@/i18n/navigation';

/** The pages a reader goes to from the live cycle, in the header's order before. */
const RELATED = [
  { href: '/how-it-works', key: 'learn' },
  { href: '/statistics', key: 'statistics' },
  { href: '/contracts', key: 'contracts' },
] as const;

/**
 * Where to go from the live cycle, rendered on the server after the rules:
 * the header's first screen belongs to the clock, and a reader who has read
 * down to the rules is the one looking for the explainer, the statistics or
 * the contracts.
 */
export async function CurrentCycleRelated() {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: 'seo' });
  return (
    <nav aria-label={t('currentCycleSummary.relatedAria')} className="border-t border-rule pt-5">
      <ul className="flex flex-wrap gap-x-8 gap-y-2">
        {RELATED.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="link-quiet inline-flex min-h-11 items-center gap-1.5 type-body-sm text-muted-foreground hover:text-foreground sm:min-h-6"
            >
              {t(`currentCycleSummary.links.${link.key}`)}
              <ArrowRight aria-hidden className="size-3.5 text-subtle" />
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
