import type { Metadata, ResolvingMetadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { createPageMetadata } from '@/utils/seo';
import { PageMessages } from '@/components/i18n/PageMessages';
import { RouteGroupNav } from '@/components/layout/RouteGroupNav';

import { PublicDataQuerySeed } from '../PublicDataQuerySeed';
import { PublicDataRouteSeoSummary } from '../PublicDataRouteSeoSummary';

import CharityCGDeposits from './CharityCGDeposits';

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
    t('publicGoodsCgContributions.title'),
    t('publicGoodsCgContributions.description'),
    undefined,
    '/public-goods-contributions-cg',
    { locale },
  );
}

export const revalidate = 300;

export default async function Page({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <PageMessages namespaces={['publicGoods', 'tables']}>
      <PublicDataQuerySeed route="public-goods-contributions-cg">
        <CharityCGDeposits
          header={
            <PublicDataRouteSeoSummary
              route="public-goods-contributions-cg"
              tabs={<RouteGroupNav group="publicGoods" current="publicGoodsProtocol" />}
            />
          }
        />
      </PublicDataQuerySeed>
    </PageMessages>
  );
}
