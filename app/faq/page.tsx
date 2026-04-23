import type { Metadata } from 'next';

import { createMetadata } from '@/utils/seo';
import { JsonLd, faqPageJsonLd, breadcrumbJsonLd } from '@/utils/jsonLd';

import { getAllItems } from './data/faq-data';
import FAQPage from './FAQPage';

export const metadata: Metadata = createMetadata(
  'FAQ | Cosmic Signature',
  'Frequently Asked Questions about Cosmic Signature — Performance Cycles, gestures, allocation tracks, anchoring, NFTs, Arbitrum, and governance.',
  undefined,
  '/faq',
);

export default function Page() {
  const allItems = getAllItems();
  return (
    <>
      <JsonLd data={faqPageJsonLd(allItems)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'FAQ', path: '/faq' },
        ])}
      />
      <FAQPage />
    </>
  );
}
