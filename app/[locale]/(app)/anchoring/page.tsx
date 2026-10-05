import type { Metadata } from 'next';
import { ArrowRight } from 'lucide-react';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { createMetadata } from '@/utils/seo';
import { Link } from '@/i18n/navigation';
import { buttonVariants } from '@/components/ui/button';
import { PageMessages } from '@/components/i18n/PageMessages';
import { AnchoringQuestions } from '@/components/anchoring/AnchoringQuestions';
import { AnchoringSteps } from '@/components/anchoring/AnchoringSteps';

import { readAnchorEthDeposits, readAnchorStellarImprints } from '../publicDataReads';
import { PublicDataRelatedPages, PublicDataRouteSeoSummary } from '../PublicDataRouteSeoSummary';
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
  // The two ledgers the page shows read the same lists as the header's counts (one request
  // each, shared with the header's server read): seeded, they are in the first HTML. The
  // action lists are only counted, on the server, and never sent to the page.
  const [deposits, imprints] = await Promise.all([
    readAnchorEthDeposits(),
    readAnchorStellarImprints(),
  ]);

  return (
    <PageMessages namespaces={['anchoring', 'tables']}>
      <QuerySeed
        seeds={[
          { queryKey: ['stakingCSTRewards'], data: deposits.data, at: deposits.at },
          { queryKey: ['stakingRWLKMintsGlobal'], data: imprints.data, at: imprints.at },
        ]}
      >
        <AnchoringPage
          steps={<AnchoringSteps />}
          questions={<AnchoringQuestions className="mt-[var(--block-gap)] sm:mt-20" />}
          related={<PublicDataRelatedPages route="anchoring" className="mt-[var(--block-gap)]" />}
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
