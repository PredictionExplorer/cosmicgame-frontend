import type { Metadata, ResolvingMetadata } from 'next';
import { ArrowDown } from 'lucide-react';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { createPageMetadata } from '@/utils/seo';
import { PageMessages } from '@/components/i18n/PageMessages';
import { buttonVariants } from '@/components/ui/button';

import { PublicDataQuerySeed } from '../PublicDataQuerySeed';
import { PublicDataRouteSeoSummary } from '../PublicDataRouteSeoSummary';

import EthDonations from './EthDonations';

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
    t('ethContribution.title'),
    t('ethContribution.description'),
    undefined,
    '/eth-contribution',
    { locale },
  );
}

export const revalidate = 300;

/** The contribution form's anchor. */
const FORM_ID = 'contribute';

export default async function Page({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'ethContribution' });

  return (
    <PageMessages namespaces={['ethContribution', 'marketing', 'tables']}>
      <PublicDataQuerySeed route="eth-contribution">
        <EthDonations
          formId={FORM_ID}
          header={
            <PublicDataRouteSeoSummary
              route="eth-contribution"
              actions={
                // From `lg` the form stands beside the ledger; on narrower
                // screens it follows the ledger, so the header offers a jump.
                <a
                  href={`#${FORM_ID}`}
                  className={buttonVariants({ variant: 'outline', className: 'lg:hidden' })}
                >
                  {t('page.jumpToForm')}
                  <ArrowDown aria-hidden />
                </a>
              }
            />
          }
        />
      </PublicDataQuerySeed>
    </PageMessages>
  );
}
