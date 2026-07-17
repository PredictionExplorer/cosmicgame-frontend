import type { Metadata } from 'next';

import { createMetadata } from '@/utils/seo';
import { JsonLd, faqPageJsonLd, breadcrumbJsonLd } from '@/utils/jsonLd';

import { getAllItems } from './data/faq-data';
import FAQPage from './FAQPage';

export const metadata: Metadata = createMetadata(
  'Cosmic Signature FAQ | Arbitrum On-Chain Art Protocol',
  'Answers to common questions about Cosmic Signature, Performance Cycles, gestures, CST, three-body NFT art, Arbitrum, anchoring, contracts, and protocol security.',
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
