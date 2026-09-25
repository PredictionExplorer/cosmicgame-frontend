import { ArrowRight } from 'lucide-react';
import { getLocale, getTranslations } from 'next-intl/server';

import { formatId } from '@/utils/format/ids';
import { getLocaleConfig } from '@/i18n/localeConfig';
import { cn } from '@/lib/utils';
import { PageMessages } from '@/components/i18n/PageMessages';
import { SiteLink } from '@/components/layout/SiteLink';
import { buttonVariants } from '@/components/ui/button';
import { PageShell } from '@/components/ui/page-shell';

import { readDashboard } from '../publicDataReads';

import { SignatureNotFoundIntro } from './SignatureNotFoundIntro';

/**
 * "Page not found · Cosmic Signature" and `noindex, follow` in the head,
 * like every app 404.
 */
export { generateNotFoundMetadata as generateMetadata } from '@/components/layout/notFoundMetadata';

/**
 * A Signature's page for a token that does not exist (`detail/[id]/layout`
 * answers it with a real 404): an empty plate where the work would hang,
 * the number that was asked for, how Signatures are numbered and the newest
 * one, and the way back to the gallery. Never a made-up record.
 */
export default async function SignatureNotFound() {
  const [locale, t, tErrors, dashboard] = await Promise.all([
    getLocale(),
    getTranslations('detail'),
    getTranslations('errors'),
    readDashboard(),
  ]);
  // Sentences run on after a space, or with none in Chinese and Japanese.
  const sentenceGap = getLocaleConfig(locale).wordSpacing ? ' ' : '';
  const imprinted = dashboard.data?.MainStats?.NumCSTokenMints;
  const newest =
    typeof imprinted === 'number' && Number.isSafeInteger(imprinted) && imprinted > 0
      ? imprinted - 1
      : null;

  return (
    <PageShell variant="data" backdrop="none">
      <PageMessages namespaces={['detail']}>
        <section
          aria-labelledby="signature-not-found-heading"
          className="mx-auto flex w-full max-w-2xl flex-col items-center py-10 text-center sm:py-16"
        >
          <p className="mb-6 type-eyebrow text-subtle">{tErrors('notFound.code')}</p>
          <SignatureNotFoundIntro />
          <p className="mt-4 type-lede text-muted-foreground">
            {t('notFound.description')}
            {newest === null
              ? null
              : `${sentenceGap}${t('notFound.newest', { id: formatId(newest).slice(1) })}`}
          </p>
          <div className="mt-8 flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:justify-center">
            <SiteLink
              href="/gallery"
              kind="internal"
              prefetch="intent"
              className={cn(buttonVariants({ variant: 'default', size: 'lg' }), 'no-underline')}
            >
              {tErrors('notFound.secondaryCta')}
              <ArrowRight aria-hidden />
            </SiteLink>
            {newest === null ? null : (
              <SiteLink
                href={`/detail/${newest}`}
                kind="internal"
                prefetch="intent"
                className={cn(buttonVariants({ variant: 'outline', size: 'lg' }), 'no-underline')}
              >
                {t('notFound.newestLink')}
              </SiteLink>
            )}
          </div>
        </section>
      </PageMessages>
    </PageShell>
  );
}
