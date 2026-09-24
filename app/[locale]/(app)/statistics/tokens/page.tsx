import type { Metadata, ResolvingMetadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { APP_ORIGIN, localeHref } from '@/lib/hostRouting';
import { JsonLd, breadcrumbJsonLd, jsonLdInLanguage, webPageJsonLd } from '@/utils/jsonLd';
import { createPageMetadata } from '@/utils/seo';
import { PageMessages } from '@/components/i18n/PageMessages';

import { STATISTICS_SECTIONS } from '../statistics-sections';
import { readDashboard } from '../../publicDataReads';
import { StatisticsPageIntro } from '../StatisticsPageIntro';
import {
  CstHoldersFigure,
  CstSupplyFigure,
  DashboardCountFigure,
  NftHoldersFigure,
} from '../StatisticsFigures';
import { dashboardCount } from '../dashboardCounts';

import TokensPanel from './TokensPanel';

const section = STATISTICS_SECTIONS.find((s) => s.slug === 'tokens')!;

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
    t('statisticsTokens.title'),
    t('statisticsTokens.description'),
    undefined,
    section.href,
    { locale },
  );
}

export const revalidate = 300;

export default async function Page({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'statistics' });
  const title = t(`navigation.${section.messageKey}.title`);
  const description = t(`navigation.${section.messageKey}.description`);
  const inLanguage = jsonLdInLanguage(locale);
  const dashboard = await readDashboard();

  return (
    <PageMessages namespaces={['detail', 'marketing', 'statistics', 'tables']}>
      <>
        <JsonLd
          data={[
            webPageJsonLd({
              name: title,
              description,
              url: localeHref(APP_ORIGIN, section.href, locale),
              inLanguage,
            }),
            breadcrumbJsonLd(
              [
                { name: t('breadcrumbs.statistics'), path: '/statistics' },
                { name: t(`navigation.${section.messageKey}.label`), path: section.href },
              ],
              localeHref(APP_ORIGIN, '/', locale),
            ),
          ]}
        />
        <StatisticsPageIntro
          title={title}
          description={description}
          figures={[
            {
              id: 'nftHolders',
              label: t('metrics.cosmicSignatureNftHolders.label'),
              info: t('metrics.cosmicSignatureNftHolders.tooltip'),
              value: <NftHoldersFigure />,
            },
            {
              id: 'cstHolders',
              label: t('metrics.cstErc20Holders.label'),
              info: t('metrics.cstErc20Holders.tooltip'),
              value: <CstHoldersFigure />,
            },
            {
              id: 'cstSupply',
              label: t('metrics.totalSupplyErc20.label'),
              info: t('metrics.totalSupplyErc20.tooltip'),
              value: <CstSupplyFigure />,
            },
            {
              id: 'attachedNfts',
              label: t('metrics.attachedNfts.label'),
              info: t('metrics.attachedNfts.tooltip'),
              value: (
                <DashboardCountFigure
                  metric="attachedNfts"
                  seed={dashboard.data ? dashboardCount(dashboard.data, 'attachedNfts') : undefined}
                />
              ),
            },
          ]}
        />
        <TokensPanel />
      </>
    </PageMessages>
  );
}
