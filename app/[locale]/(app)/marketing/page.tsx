import type { Metadata, ResolvingMetadata } from 'next';
import { ArrowDown } from 'lucide-react';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { createPageMetadata } from '@/utils/seo';
import { PageMessages } from '@/components/i18n/PageMessages';
import { buttonVariants } from '@/components/ui/button';
import { LedgerPage } from '@/components/ledger/LedgerPage';
import { HowItWorks } from '@/components/marketing/HowItWorks';
import { MarketingCTA } from '@/components/marketing/MarketingCTA';

import { PublicDataQuerySeed } from '../PublicDataQuerySeed';
import { PublicDataRouteSeoSummary } from '../PublicDataRouteSeoSummary';

import MarketingRewards from './MarketingRewards';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata(
  { params }: PageProps,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  return createPageMetadata(
    parent,
    t('outreach.title'),
    t('outreach.description'),
    undefined,
    '/marketing',
    { locale },
  );
}

export const revalidate = 300;

/**
 * The Outreach Reserve: the server-rendered header with the programme's
 * figures, then the records — the top contributors and every allocation —
 * leading the body. How to take part (the invitation with its email, then
 * the three steps) stands beside them from `lg`, sticky, so the one real
 * action is never below the fold; on narrower screens it follows the
 * ledgers, steps first, and the header offers a jump to it. Only the two
 * ledgers and the copy button run on the client.
 */
export default async function Page({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'marketing' });

  return (
    <PageMessages namespaces={['marketing', 'tables']}>
      <PublicDataQuerySeed route="marketing">
        <LedgerPage
          header={
            <PublicDataRouteSeoSummary
              route="marketing"
              actions={
                // From lg the invitation is already beside the ledgers.
                <a
                  href="#how-it-works"
                  className={buttonVariants({ variant: 'outline', className: 'lg:hidden' })}
                >
                  {t('learnHow')}
                  <ArrowDown aria-hidden />
                </a>
              }
            />
          }
          aside={
            <div className="flex flex-col gap-[var(--block-gap)]">
              <div className="lg:order-2">
                <HowItWorks />
              </div>
              <div className="lg:order-1">
                <MarketingCTA />
              </div>
            </div>
          }
        >
          <MarketingRewards />
        </LedgerPage>
      </PublicDataQuerySeed>
    </PageMessages>
  );
}
