import type { Metadata } from 'next';

import { APP_ORIGIN } from '@/lib/hostRouting';
import { JsonLd, breadcrumbJsonLd, webPageJsonLd } from '@/utils/jsonLd';
import { createMetadata } from '@/utils/seo';

import HowToPlayPage from './HowToPlayPage';

const description =
  'Learn how a Cosmic Signature Performance Cycle unfolds \u2014 from the Calibration Window through Gestures to final allocation distribution.';

export const metadata: Metadata = createMetadata(
  'How Cosmic Signature Works | Performance Cycles, Gestures, and NFTs',
  description,
  undefined,
  '/how-it-works',
);

export default function Page() {
  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({
            name: 'How Cosmic Signature Works',
            description,
            url: `${APP_ORIGIN}/how-it-works`,
          }),
          breadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: 'How It Works', path: '/how-it-works' },
          ]),
        ]}
      />
      <HowToPlayPage />
    </>
  );
}
