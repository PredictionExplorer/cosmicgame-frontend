import type { Metadata } from 'next';
import { ArrowRight } from 'lucide-react';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { createMetadata } from '@/utils/seo';
import { Link } from '@/i18n/navigation';
import { buttonVariants } from '@/components/ui/button';
import { PageMessages } from '@/components/i18n/PageMessages';
import { AnchoringQuestions } from '@/components/anchoring/AnchoringQuestions';
import { AnchoringSteps } from '@/components/anchoring/AnchoringSteps';

import {
  readAnchorCstActions,
  readAnchorEthDeposits,
  readAnchorRwalkActions,
  readAnchorStellarImprints,
} from '../publicDataReads';
import { PublicDataRouteSeoSummary } from '../PublicDataRouteSeoSummary';
import { QuerySeed } from '../QuerySeed';

import AnchoringPage from './AnchoringPage';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  return createMetadata(t('anchoring.title'), t('anchoring.description'), undefined, '/anchoring', {
    locale,
  });
}

export const revalidate = 300;

export default async function Page({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'anchoring' });
  // The header's counts and the ledgers read the same four lists (one request each, shared
  // with the header's server read): seeded, they are in the first HTML; a read that failed
  // here is read again by the browser rather than cached as a dash.
  const [cstActions, rwalkActions, deposits, imprints] = await Promise.all([
    readAnchorCstActions(),
    readAnchorRwalkActions(),
    readAnchorEthDeposits(),
    readAnchorStellarImprints(),
  ]);

  return (
    <PageMessages namespaces={['anchoring', 'tables']}>
      <QuerySeed
        seeds={[
          { queryKey: ['cstAnchorActions'], data: cstActions.data, at: cstActions.at },
          { queryKey: ['rwlkAnchorActions'], data: rwalkActions.data, at: rwalkActions.at },
          { queryKey: ['stakingCSTRewards'], data: deposits.data, at: deposits.at },
          { queryKey: ['stakingRWLKMintsGlobal'], data: imprints.data, at: imprints.at },
        ]}
      >
        <AnchoringPage
          steps={<AnchoringSteps />}
          questions={<AnchoringQuestions className="mt-[var(--block-gap)] sm:mt-20" />}
          seoSummary={
            <PublicDataRouteSeoSummary
              route="anchoring"
              actions={
                <Link href="/my-anchors" className={buttonVariants({ variant: 'default' })}>
                  {t('overview.start')}
                  <ArrowRight aria-hidden />
                </Link>
              }
            />
          }
        />
      </QuerySeed>
    </PageMessages>
  );
}
