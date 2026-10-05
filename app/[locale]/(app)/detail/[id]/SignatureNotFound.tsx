import { ArrowRight } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

import { formatId } from '@/utils/format/ids';
import { getLocaleConfig } from '@/i18n/localeConfig';
import { cn } from '@/lib/utils';
import { SiteLink } from '@/components/layout/SiteLink';
import { PendingPlate } from '@/components/ui/art-frame';
import { buttonVariants } from '@/components/ui/button';
import { PageShell } from '@/components/ui/page-shell';

import { readDashboard } from '../../publicDataReads';

/**
 * A Signature's page for a token the API holds no record of: an empty plate
 * on the wall where the work would hang, captioned with the number that was
 * asked for (#000060, in the identifier face), a heading that says it has
 * not been imprinted yet, how Signatures are numbered and the newest one,
 * and the way back to the gallery. Never a made-up record.
 *
 * The page renders it on the server, in place of `notFound()`: a segment's
 * `notFound()` reaches the browser as Next.js's bare error shell, blank
 * without script. So it answers 200 with `noindex` (the page's metadata), as
 * a streamed 404 does, and the cached render is kept a minute, since the
 * number may be imprinted at the next finalization.
 */
export async function SignatureNotFound({ locale, tokenId }: { locale: string; tokenId: number }) {
  const [t, tErrors, dashboard] = await Promise.all([
    getTranslations({ locale, namespace: 'detail' }),
    getTranslations({ locale, namespace: 'errors' }),
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
      <section
        aria-labelledby="signature-not-found-heading"
        className="mx-auto flex w-full max-w-2xl flex-col items-center py-10 text-center sm:py-16"
      >
        <p className="mb-6 type-eyebrow text-subtle">{tErrors('notFound.code')}</p>
        {/* Decorative: the heading below says what the empty plate means. */}
        <PendingPlate detail={formatId(tokenId)} className="mx-auto max-w-72 sm:max-w-sm" />
        <h1 id="signature-not-found-heading" className="mt-8 type-display-sm text-balance">
          {t('notFound.title')}
        </h1>
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
    </PageShell>
  );
}
