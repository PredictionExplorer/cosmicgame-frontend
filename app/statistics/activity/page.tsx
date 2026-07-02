import type { Metadata } from 'next';

import { APP_ORIGIN } from '@/lib/hostRouting';
import { JsonLd, breadcrumbJsonLd, webPageJsonLd } from '@/utils/jsonLd';
import { createMetadata } from '@/utils/seo';

import { STATISTICS_SECTIONS } from '../statistics-sections';
import { StatisticsPageIntro } from '../StatisticsPageIntro';

import ActivityPanel from './ActivityPanel';

const section = STATISTICS_SECTIONS.find((s) => s.slug === 'activity')!;

export const metadata: Metadata = createMetadata(
  'Gesture Activity Statistics | Cosmic Signature',
  section.description,
  undefined,
  section.href,
);

export const revalidate = 300;

export default function Page() {
  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({
            name: section.title,
            description: section.description,
            url: `${APP_ORIGIN}${section.href}`,
          }),
          breadcrumbJsonLd([
            { name: 'Statistics', path: '/statistics' },
            { name: section.label, path: section.href },
          ]),
        ]}
      />
      <StatisticsPageIntro title={section.title} description={section.description} />
      <ActivityPanel />
    </>
  );
}
