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
 * figures, how allocations work, the top contributors and every allocation,
 * and how to take part. Only the two ledgers and the copy button run on the
 * client.
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
                <a href="#how-it-works" className={buttonVariants({ variant: 'outline' })}>
                  {t('learnHow')}
                  <ArrowDown aria-hidden />
                </a>
              }
            />
          }
        >
          <HowItWorks />
          <MarketingRewards />
          <MarketingCTA />
        </LedgerPage>
      </PublicDataQuerySeed>
    </PageMessages>
  );
}
