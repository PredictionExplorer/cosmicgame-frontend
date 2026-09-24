import type { Metadata, ResolvingMetadata } from 'next';
import { ArrowDown } from 'lucide-react';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { createPageMetadata } from '@/utils/seo';
import { PageMessages } from '@/components/i18n/PageMessages';
import { Button } from '@/components/ui/button';

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

export default async function Page({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'marketing' });

  return (
    <PageMessages namespaces={['marketing', 'tables']}>
      <PublicDataQuerySeed route="marketing">
        <MarketingRewards
          seoSummary={
            <PublicDataRouteSeoSummary
              route="marketing"
              actions={
                <Button asChild variant="outline">
                  <a href="#how-it-works">
                    {t('hero.learnHow')}
                    <ArrowDown aria-hidden />
                  </a>
                </Button>
              }
            />
          }
        />
      </PublicDataQuerySeed>
    </PageMessages>
  );
}
